<?php

return [
    /*
     * Allowed paths for CORS
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
     * Allowed HTTP methods
     */
    'allowed_methods' => ['*'],

    /*
     * Allowed origins (URL frontend kamu)
     */
    'allowed_origins' => [
        'http://localhost:3000',      // React default port
        'http://localhost:5173',      // Vite default port
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ],

    /*
     * Allowed origins patterns
     */
    'allowed_origins_patterns' => [],

    /*
     * Allowed headers
     */
    'allowed_headers' => ['*'],

    /*
     * Exposed headers
     */
    'exposed_headers' => [],

    /*
     * Max age
     */
    'max_age' => 0,

    /*
     * Support credentials (untuk authentication)
     */
    'supports_credentials' => true,
];