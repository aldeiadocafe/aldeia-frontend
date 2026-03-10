import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'companys';

export const getAllCompanys = () => axios.get(REST_API_BASE_URL);

export const createCompany = (company) => axios.post(REST_API_BASE_URL, company);

export const getCompanyById = (companyId) => axios.get(REST_API_BASE_URL + '/' + companyId);

export const updateCompany = (companyId, company) => axios.put(REST_API_BASE_URL + '/' + companyId, company);

export const deleteCompany = (companyId) => axios.delete(REST_API_BASE_URL + '/' + companyId);