import axios from 'axios';
import {Config} from "./config.js";
import Cookies from 'js-cookie';

export class ApiWithServer{
    static async getConfig(){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.get(`${Config.server}/api/terminal/getTerminal/${id}`, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }

    static async setOrders(orders){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.put(`${Config.server}/api/terminal/setOrderValues/${id}`, {
            orders: JSON.stringify(orders)
        }, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }

    static async setSavedSymbols(symbols){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.put(`${Config.server}/api/terminal/setSavedSymbols/${id}`, {
            symbols: JSON.stringify(symbols)
        }, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }

    static async setStrategies(strategies){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.put(`${Config.server}/api/terminal/setStrategies/${id}`, {
            strategies: JSON.stringify(strategies)
        }, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }

    static async setBalance(value){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.put(`${Config.server}/api/terminal/setBalance/${id}`, {
            value: value
        }, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }

    static async setOpenOrders(orders){
        let token = Cookies.get('token');
        let id = Cookies.get('terminal_id');

        let answer = await axios.put(`${Config.server}/api/terminal/setOpenOrders/${id}`, {
            orders: JSON.stringify(orders)
        }, {
            headers:{
                "Authorization": token 
            }
        });

        return answer.data;
    }
}