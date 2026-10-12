import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'draftSchedules';

export const getAllDrafSchedules = () => axios.get(REST_API_BASE_URL);

export const createDrafSchedules = (draft) => axios.post(REST_API_BASE_URL, draft);

export const getDrafSchedulesById = (draftId) => axios.get(REST_API_BASE_URL + '/' + draftId);

export const updateDrafSchedules = (draftId, draft) => axios.put(REST_API_BASE_URL + '/' + draftId, draft);

export const deleteDrafSchedules = (draftId) => axios.delete(REST_API_BASE_URL + '/' + draftId);

export const saveAllDraft = (draft) => axios.post(REST_API_BASE_URL + '/saveDraft', draft);

export const activateDraft = (ativarDraft) => axios.post(REST_API_BASE_URL + '/activateDraft', ativarDraft);