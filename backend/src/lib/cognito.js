const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminGetUserCommand,
  GetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const REGION = process.env.AWS_REGION || 'ap-south-1';
const client = new CognitoIdentityProviderClient({ region: REGION });

const USER_POOL_ID = process.env.USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

const Cognito = {
  /**
   * Register a new user in Cognito
   */
  async signUp({ email, password, fullName }) {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email.toLowerCase().trim(),
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email.toLowerCase().trim() },
        ...(fullName ? [{ Name: 'name', Value: fullName.trim() }] : []),
      ],
    };

    const command = new SignUpCommand(params);
    const response = await client.send(command);
    return {
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
      codeDeliveryDetails: response.CodeDeliveryDetails,
    };
  },

  /**
   * Confirm sign up with 6-digit verification code sent to email
   */
  async confirmSignUp({ email, code }) {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email.toLowerCase().trim(),
      ConfirmationCode: code.trim(),
    };

    const command = new ConfirmSignUpCommand(params);
    return await client.send(command);
  },

  /**
   * Resend verification code for unconfirmed account
   */
  async resendConfirmationCode({ email }) {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email.toLowerCase().trim(),
    };

    const command = new ResendConfirmationCodeCommand(params);
    const response = await client.send(command);
    return response.CodeDeliveryDetails;
  },

  /**
   * Authenticate user with USER_PASSWORD_AUTH flow
   */
  async login({ email, password }) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email.toLowerCase().trim(),
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);
    const authResult = response.AuthenticationResult;

    if (!authResult) {
      throw new Error('Authentication challenge required');
    }

    return {
      idToken: authResult.IdToken,
      accessToken: authResult.AccessToken,
      refreshToken: authResult.RefreshToken,
      expiresIn: authResult.ExpiresIn,
      tokenType: authResult.TokenType,
    };
  },

  /**
   * Initiate forgot password flow - sends code to registered email
   */
  async forgotPassword({ email }) {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email.toLowerCase().trim(),
    };

    const command = new ForgotPasswordCommand(params);
    const response = await client.send(command);
    return response.CodeDeliveryDetails;
  },

  /**
   * Confirm forgot password flow - resets password using code
   */
  async confirmForgotPassword({ email, code, newPassword }) {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email.toLowerCase().trim(),
      ConfirmationCode: code.trim(),
      Password: newPassword,
    };

    const command = new ConfirmForgotPasswordCommand(params);
    return await client.send(command);
  },

  /**
   * Get user attributes using Access Token
   */
  async getUser(accessToken) {
    const command = new GetUserCommand({ AccessToken: accessToken });
    const response = await client.send(command);
    const attributes = {};
    for (const attr of response.UserAttributes || []) {
      attributes[attr.Name] = attr.Value;
    }
    return {
      username: response.Username,
      attributes,
    };
  },

  /**
   * Admin lookup user by username (email)
   */
  async adminGetUser(email) {
    if (!USER_POOL_ID) return null;
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email.toLowerCase().trim(),
      });
      return await client.send(command);
    } catch (err) {
      if (err.name === 'UserNotFoundException') return null;
      throw err;
    }
  },
};

module.exports = Cognito;
