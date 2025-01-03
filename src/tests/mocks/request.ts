export function mockRequest(body: any, headers: Record<string, string> = {}) {
    return new Request('http://localhost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    });
}
