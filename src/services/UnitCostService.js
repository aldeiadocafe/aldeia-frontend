import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'unitcosts';

export const getAllUnitCosts = () => axios.get(REST_API_BASE_URL);

export const createUnitCost = (unitCost) => axios.post(REST_API_BASE_URL, unitCost);
export const AtualizarCustoGCom = (unitCost) => axios.post(REST_API_BASE_URL + '/atualizarCustoGCOM', unitCost);

export const getUnitCostById = (unitCostId) => axios.get(REST_API_BASE_URL + '/' + unitCostId);

export const updateUnitCost = (unitCostId, unitCost) => axios.put(REST_API_BASE_URL + '/' + unitCostId, unitCost);

export const deleteUnitCost = (unitCostId) => axios.delete(REST_API_BASE_URL + '/' + unitCostId);