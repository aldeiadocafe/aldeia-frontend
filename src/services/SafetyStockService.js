import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'safetystocks';

export const getAllSafetys = () => axios.get(REST_API_BASE_URL);

export const createSafety = (safety) => axios.post(REST_API_BASE_URL, safety);

export const getSafetyById = (safetyId) => axios.get(REST_API_BASE_URL + '/' + safetyId);

export const updateSafety = (safetyId, safety) => axios.put(REST_API_BASE_URL + '/' + safetyId, safety);

export const deleteSafety = (safetyId) => axios.delete(REST_API_BASE_URL + '/' + safetyId);