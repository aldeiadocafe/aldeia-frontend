import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'users';

export const getAllUsers = () => axios.get(REST_API_BASE_URL);

export const createUser = (user) => axios.post(REST_API_BASE_URL, user);

export const getUserById = (userId) => axios.get(REST_API_BASE_URL + '/' + userId);

export const updateUser = (userId, user) => axios.put(REST_API_BASE_URL + '/' + userId, user);

export const deleteUser = (userId) => axios.delete(REST_API_BASE_URL + '/' + userId);