import type { APIRoute } from 'astro';
import { MockDokkuAPI } from '../../../../../lib/mock-dokku';

const mockAPI = new MockDokkuAPI();

export const GET: APIRoute = async ({ params }) => {
    try {
        const { name } = params;
        if (!name) {
            return new Response(JSON.stringify({ error: 'App name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apps = await mockAPI.apps();
        const app = await apps.get(name);
        
        return new Response(JSON.stringify(app), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return new Response(JSON.stringify({ error: 'App not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.error('Error fetching app details:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const { name } = params;
        if (!name) {
            return new Response(JSON.stringify({ error: 'App name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apps = await mockAPI.apps();
        await apps.delete(name);
        
        return new Response(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return new Response(JSON.stringify({ error: 'App not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.error('Error deleting app:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const { name } = params;
        if (!name) {
            return new Response(JSON.stringify({ error: 'App name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const apps = await mockAPI.apps();
        const updatedApp = await apps.update(name, body);
        
        return new Response(JSON.stringify(updatedApp), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            return new Response(JSON.stringify({ error: 'App not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.error('Error updating app:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
