import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'login';

export const getLogin = (login) => axios.post(REST_API_BASE_URL, login);
