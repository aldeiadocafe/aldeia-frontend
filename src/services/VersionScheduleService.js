import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'versionSchedules';

export const getAllVersionSchedules = () => axios.get(REST_API_BASE_URL);

export const getVersionSchedulesById = (versionId) => axios.get(REST_API_BASE_URL + '/' + versionId);
