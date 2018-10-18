"use strict";
const axios = require('axios');

/**
 * Class representing Infermedica API, to make API requests
 */
class InfermedicaApi {

    /**
     * Creates an api instance with the given credentials
     * @param {string} appId App-Id provided on Infermedica developer's portal
     * @param {string} appKey App-Key provided on Infermedica developer's portal
     */
    constructor(appId, appKey) {
        this.http = axios.create({
            baseURL: 'https://api.infermedica.com/v2/',
            headers: {
                'App-Id': appId,
                'App-Key': appKey
            }
        });
    }

    /**
     * retrives all/specific condition(s)
     * @param {string} id specific condition id
     */
    conditions(id = '') {
        return new Promise((resolve, reject) => this.http.get(`/conditions/${id}`)
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
    
    /**
     * retrieves possible diagoses and relevant observations based on provided details
     * @param {string} sex Sex (male|female)
     * @param {number} age Age
     * @param {object[]} [evidence] Array of evidences
     * @param {object} [extras={}] 
     * @param {string} [evaluated_at] time when diagnosis was evaluated in ISO 8601 format
     */
    diagnosis(sex, age, evidence = [], extras = {}, evaluated_at = null) {
        let params = {
            sex, age, evidence, extras
        };
        if(evaluated_at) {
            params['evaluated_at'] = evaluated_at;
        }
        return new Promise((resolve, reject) => this.http.post('/diagnosis', params)
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
    
    /**
     * explains which evidence impact probability of selected condition
     * @param {string} sex Sex (male|female)
     * @param {integer} age Age
     * @param {object[]} [evidence=[]] Array of evidences
     * @param {string} target target condition id
     * @param {object} [extras={}] 
     * @param {string} [evaluated_at] time when diagnosis was evaluated in ISO 8601 format
     */
    explain(sex, age, evidence, target, extras = {}, evaluated_at) {
        let params = {
            sex, age, evidence, target, extras
        };
        
        if(evaluated_at) {
            params['evaluated_at'] = evaluated_at;
        }
        
        return new Promise((resolve,reject) => this.http.post('/explain', params)
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
    
    /**
     * get API information
     */
    info() {
        return new Promise((resolve, reject) => this.http.get('/info')
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * retrieves all/specific lab_test(s)
     * @param {string} id speciifc lab_test id
     */
    labTests(id = '') {
        return new Promise((resolve, reject) => this.http.get(`/lab_tests/${id}` )
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * gets a single obervation matching the given phrase
     * @param {string} phrase Phrase string to match a single observation
     * @param {string} [sex] Sex filter (male|female) 
     */
    lookup(phrase, sex = '') {
        let params = { phrase };
        
        if(sex && sex.match(/(male|female)/)) {
            params.sex = sex;
        }
        
        return new Promise((resolve, reject) => this.http.get('/lookup', {params})
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * retrives list of mentions of obervation found in given text
     * @param {string} text user text to process
     * @param {string[]} [context] ordered list of ids of present symptoms that were already captured captured and can be used as context
     * @param {string[]} [concept_types] list of concept_types that should be captured 
     * @param {boolean} [include_tokens = false] 
     * @param {boolean} [correct_spelling = false] 
     */
    parse(text, context = [""], concept_types = null, include_tokens = false, correct_spelling = false) {
        if (text.length > 1024) {
            return Promise.reject({"error": {"message": "Please provide no more than 1024 character text to parse"}});
        }
        let params = {text, context, include_tokens, correct_spelling};
        if(concept_types && Array.isArray(concept_types)) {
            params['concept_types'] = concept_types;
        }
        return new Promise((resolve, reject) => this.http.post('/parse', params)
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
    
    /**
     * retrives all/specific risk_factor(s)
     * @param {string} id specific risk_factor id
     */
    riskFactors(id = '') {
        return new Promise((resolve, reject) => this.http.get(`/risk_factors/${id}` )
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * retrive a list of observations matching the given phrase 
     * @param {string} phrase Phrase string to search
     * @param {string} sex Sex filter (male|female)
     * @param {integer} [max_results=8] maximum results to return
     * @param {string[]} [type] types of results (symptom|risk_factor|lab_test)
     */
    search(phrase, sex = '', max_results = 8, type = []) {
        let params = {phrase, max_results};
        
        if(sex && sex.match(/(male|female)/)) {
            params.sex = sex;
        }
        
        if(type.length && type.every(val => val.match(/(symptom|risk_factor|lab_test)/))) {
            params.type = type;
        }
        
        return new Promise((resolve, reject) => this.http.get('search' )
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * suggests possible symptoms based on provided information
     * @param {string} [sex] Sex (male|female)
     * @param {integer} [age] Age
     * @param {object[]} [evidence=[]] Array of evidences, evidence could be a observation or condition
     * @param {object} [extras={}] 
     * @param {string} [evaluated_at] time when diagnosis was evaluated in ISO 8601 format
     * @param {integer} [max_results = 8] maximum suggestions to retrive
     */
    suggest(sex, age, evidence, extras = {}, evaluated_at = null, max_results = 8) {
        let params = {
            sex, age, evidence, extras
        };
        if(evaluated_at) {
            params['evaluated_at'] = evaluated_at;
        }
        return new Promise((resolve,reject) => this.http.post(`/suggest?max_results=${max_results}`, params)
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
    
    /**
     * estimates triage level based on information provided
     * @param {string} sex Sex (male|female)
     * @param {number} age Age
     * @param {object[]} [evidence] Array of evidences
     * @param {object} [extras={}] 
     * @param {string} [evaluated_at] time when diagnosis was evaluated in ISO 8601 format
     */
    triage(sex, age, evidence, extras = {}, evaluated_at = null) {
        let params = {
            sex, age, evidence, extras
        };
        if(evaluated_at) {
            params['evaluated_at'] = evaluated_at;
        }
        return new Promise((resolve, reject) => this.http.post('/triage', params)
        .then(response => resolve(response.data))
        .catch(reject)
        );
    }
    
    /**
     * retrives list/specific symptom(s) 
     * @param {string} id specific symptom id
     */
    symptoms(id = '') {
        return new Promise((resolve, reject) => this.http.get(`/symptoms/${id}` )
            .then(response => resolve(response.data))
            .catch(reject)
        );
    }
}
module.exports = InfermedicaApi;