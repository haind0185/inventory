require('dotenv').config();
module.exports = {
    packagerConfig: {
        extraResource: [
            'icon.ico'
        ]
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupIcon: 'icon.ico',
                authors: 'Haind',
                certificateFile: './cert.pfx',
                certificatePassword: process.env.CERT_PASSWORD,
                // Kích hoạt tính năng auto-update
                setupExe: 'inventory-1.0.7-Setup.exe',
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'haind0185',
                    name: 'inventory'
                },
                authToken: process.env.GITHUB_TOKEN, // Token GitHub có quyền repo
                prerelease: false,
                // Tạo release và upload files
                draft: false,
            }
        }
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-vite',
            config: {
                // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
                // If you are familiar with Vite configuration, it will look really familiar.
                build: [
                    {
                        // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                        entry: 'src/main.js',
                        config: 'vite.main.config.mjs',
                    },
                    {
                        entry: 'src/preload.js',
                        config: 'vite.preload.config.mjs',
                    }
                ],
                renderer: [
                    {
                        name: 'main_window',
                        config: 'vite.renderer.config.mjs',
                    },
                ],
            },
        },
    ],
};
