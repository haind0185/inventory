import axios from 'axios';
import { store } from '@/store/';

const pendingRequests = new Map();
const TIME_WINDOW = 2000;

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
    withCredentials: false,
    headers: {
        Accept: '*',
    },
});

api.interceptors.request.use((config) => {
    /**
     * Check double request
     */
    const requestKey = `${config.method}${config.url}${JSON.stringify(
        config.params
    )}${JSON.stringify(config.data)}`;
    if (pendingRequests.has(requestKey)) {
        const lastRequestTime = pendingRequests.get(requestKey);

        if (Date.now() - lastRequestTime < TIME_WINDOW) {
            return Promise.reject({ message: 'Duplicate request blocked' });
        }
    }

    pendingRequests.set(requestKey, Date.now());
    return config;
});

api.interceptors.response.use(
    (response) => {
        /**
         * Check double request
         */
        const requestKey = `${response.config.method}${
            response.config.url
        }${JSON.stringify(response.config.params)}${JSON.stringify(
            response.config.data
        )}`;
        pendingRequests.delete(requestKey);

        if (
            ![200, 201].includes(response?.data?.code) &&
            response?.config?.method != 'get' &&
            response?.data?.code != 404
        ) {
            store.showErrorModal(response?.data?.message);
        }

        return response;
    },
    (error) => {
        /**
         * Check double request
         */
        if (error.config) {
            const requestKey = `${error.config.method}${
                error.config.url
            }${JSON.stringify(error.config.params)}${JSON.stringify(
                error.config.data
            )}`;
            pendingRequests.delete(requestKey);
        }
        return error;
    }
);

export default api;
