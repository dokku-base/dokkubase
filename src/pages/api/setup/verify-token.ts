import { verifyToken } from '../../../actions/setup/verify';

// Export the handler for API routes
export { verifyToken as handler };

export async function POST(request: Request) {
    return verifyToken(request);
}

export const runtime = 'edge';
