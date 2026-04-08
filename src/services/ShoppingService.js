import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'shoppings';

export const getAllShoppings = () => axios.get(REST_API_BASE_URL);

export const createShopping = (shopping) => axios.post(REST_API_BASE_URL, shopping);

export const getShoppingById = (shoppingId) => axios.get(REST_API_BASE_URL + '/' + shoppingId);

export const updateShopping = (shoppingId, shopping) => axios.put(REST_API_BASE_URL + '/' + shoppingId, shopping);

export const deleteShopping = (shoppingId) => axios.delete(REST_API_BASE_URL + '/' + shoppingId);