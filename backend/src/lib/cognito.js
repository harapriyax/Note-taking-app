const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  ListUsersCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const REGION = process.env.AWS_REGION || 'ap-south-1';
const client = new CognitoIdentityProviderClient({ region: REGION });

const USER_POOL_ID = process.env.USER_POOL_ID;

const Cognito = {
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

  /**
   * Find user by sub (UUID) using ListUsers filter
   */
  async adminGetUserBySub(sub) {
    if (!USER_POOL_ID) return null;
    try {
      const command = new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `sub = "${sub}"`,
        Limit: 1,
      });
      const response = await client.send(command);
      if (response.Users && response.Users.length > 0) {
        const user = response.Users[0];
        return {
          Username: user.Username,
          UserAttributes: user.Attributes,
          UserStatus: user.UserStatus,
        };
      }
      return null;
    } catch (err) {
      console.error('adminGetUserBySub error:', err);
      return null;
    }
  },
};

module.exports = Cognito;
