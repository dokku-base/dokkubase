import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../lib/mock-dokku';

const mockAPI = new MockDokkuAPI();

export const GET: APIRoute = async () => {
    try {
        const apps = await mockAPI.apps();
        const appList = await apps.list();
        return new Response(JSON.stringify(appList), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching apps:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    console.log('POST /api/mock-dokku/apps - Start');
    try {
        const apps = await mockAPI.apps();
        console.log('Got mockAPI.apps()');
        
        const body = await request.json();
        console.log('Request body:', body);

        // Validate name first
        console.log('Validating name...');
        const nameErrors = await apps.validateName(body.name || '');
        console.log('Name validation result:', nameErrors);
        
        if (nameErrors.length > 0) {
            console.log('Name validation failed:', nameErrors);
            return new Response(JSON.stringify({ 
                error: 'Validation failed',
                details: nameErrors
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Then validate git URL if provided
        if (body.gitUrl) {
            const gitErrors = await apps.validateGitUrl(body.gitUrl);
            if (gitErrors.length > 0) {
                return new Response(JSON.stringify({ 
                    error: 'Validation failed',
                    details: gitErrors
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Finally validate env if provided
        if (body.env) {
            const envErrors = await apps.validateEnv(body.env);
            if (envErrors.length > 0) {
                return new Response(JSON.stringify({ 
                    error: 'Validation failed',
                    details: envErrors
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        const newApp = await apps.create({
            name: body.name,
            gitUrl: body.gitUrl,
            gitBranch: body.gitBranch,
            env: body.env
        });

        return new Response(JSON.stringify(newApp), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            if (error.message.includes('Validation failed')) {
                return new Response(JSON.stringify({ 
                    error: 'Validation failed',
                    details: JSON.parse(error.message.replace('Validation failed: ', ''))
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        console.error('Error creating app:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
