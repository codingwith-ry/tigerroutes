import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp-up to 50 users
    { duration: '1m', target: 100 },    // stay at 100 users
    { duration: '30s', target: 0 }     // ramp-down
  ],
};

export default function () {
  http.get('https://tigerroutes.org/api/ping'); 
  sleep(1);
}
