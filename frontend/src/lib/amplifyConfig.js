import { Amplify } from 'aws-amplify'

const region = import.meta.env.VITE_AWS_REGION || 'ap-south-1'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      NoteFlowAPI: {
        endpoint: import.meta.env.VITE_API_URL,
        region,
      },
    },
  },
})

export default Amplify
