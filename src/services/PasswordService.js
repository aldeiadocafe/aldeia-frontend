import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'passwords';

export const createPassword = (password) => axios.post(REST_API_BASE_URL, password);

export const getPasswordById = (passwordId) => axios.get(REST_API_BASE_URL + '/' + passwordId);
