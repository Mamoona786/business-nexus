import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Nexus API',
      version: '1.0.0',
      description: 'API documentation for Business Nexus MERN application'
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  name: 'Ali Khan',
                  email: 'ali@example.com',
                  password: 'Password123',
                  role: 'entrepreneur'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  email: 'ali@example.com',
                  password: 'Password123',
                  role: 'entrepreneur'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'OTP sent to email'
            }
          }
        }
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify login OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  email: 'ali@example.com',
                  otp: '123456',
                  role: 'entrepreneur'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful'
            }
          }
        }
      },
      '/settings': {
        get: {
          tags: ['Settings'],
          summary: 'Get current user settings',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Settings fetched successfully'
            }
          }
        }
      },
      '/settings/account': {
        put: {
          tags: ['Settings'],
          summary: 'Update account settings',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  name: 'Ali Khan',
                  email: 'ali@example.com',
                  location: 'Lahore, Pakistan',
                  bio: 'Startup founder'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Account settings updated'
            }
          }
        }
      },
      '/settings/password': {
        put: {
          tags: ['Settings'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  currentPassword: 'Password123',
                  newPassword: 'NewPassword123'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Password changed successfully'
            }
          }
        }
      },
      '/settings/notifications': {
        put: {
          tags: ['Settings'],
          summary: 'Update notification preferences',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  email: true,
                  inApp: true,
                  messages: true,
                  meetings: true,
                  documents: true,
                  payments: true,
                  collaborations: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Notification preferences updated'
            }
          }
        }
      },
      '/settings/privacy': {
        put: {
          tags: ['Settings'],
          summary: 'Update privacy settings',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  profileVisibility: 'public',
                  showEmail: false,
                  showOnlineStatus: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Privacy settings updated'
            }
          }
        }
      },
      '/settings/2fa': {
        put: {
          tags: ['Settings'],
          summary: 'Toggle 2FA preference',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  enabled: true
                }
              }
            }
          },
          responses: {
            200: {
              description: '2FA preference updated'
            }
          }
        }
      },
      '/support': {
        post: {
          tags: ['Support'],
          summary: 'Submit support message',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  name: 'Ali Khan',
                  email: 'ali@example.com',
                  subject: 'Need help',
                  message: 'I need help with my account.'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Support message submitted'
            }
          }
        }
      },
      '/support/my': {
        get: {
          tags: ['Support'],
          summary: 'Get my support messages',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Support messages fetched'
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
