import axios from 'axios';
import { APIRootPath } from '@fed-exam/config';

export type Ticket = {
    id: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];
}

export enum SortType { byDateDESC, byDateASC };


export type ApiClient = {
    getTickets: (pageNumer?: number) => Promise<Ticket[]>;//Adding optinal page nuber request to the server (default 1)
    addClonedTicket: (ticket: Ticket) => Promise<Ticket>;
    renameTitle: (id: string, title: String) => Promise<Ticket>;
}


export const createApiClient = (): ApiClient => {
    return {
        getTickets: (pageNumer: number = 1) => {
            return axios.get(`${APIRootPath}?page=${pageNumer}`).then((res) => res.data);
        },
        addClonedTicket,
        renameTitle,

    }
}

/**
 * Sending request to cloned the ticket to the server
 * @return the cloned ticket
 * @param ticket 
 */
async function addClonedTicket(ticket: Ticket): Promise<Ticket> {
    const { id, title, content, userEmail } = ticket;
    const res = await axios.post(APIRootPath, { id, title, content, userEmail });
    return res.data;
}

/**
 * Sending request to the server for rename ticket title
 * @return the ticket that updated
 * @param id 
 * @param title 
 */
async function renameTitle(id: string, title: String): Promise<Ticket> {
    const res = await axios.put(`${APIRootPath}/:${id}`, { title });
    return res.data;
}


