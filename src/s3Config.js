// This file provides configuration for AWS S3 access using Amplify Storage
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

export default Amplify;
