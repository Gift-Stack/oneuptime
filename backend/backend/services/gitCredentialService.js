const GitCredentialModel = require('../models/gitCredential');
const ErrorService = require('./errorService');
const { encrypt } = require('../config/encryptDecrypt');

module.exports = {
    findOneBy: async function(query) {
        try {
            if (!query) query = {};
            if (!query.deleted) query.deleted = false;

            const gitCredential = await GitCredentialModel.findOne(
                query
            ).populate('projectId');
            return gitCredential;
        } catch (error) {
            ErrorService.log('gitCredentialService.findOneBy', error);
            throw error;
        }
    },
    findBy: async function(query, limit, skip) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') skip = Number(skip);

            if (typeof limit === 'string') limit = Number(limit);

            if (!query) query = {};

            if (!query.deleted) query.deleted = false;

            const gitCredentials = await GitCredentialModel.find(query)
                .sort([['createdAt', -1]])
                .limit(limit)
                .skip(skip)
                .populate('projectId');

            return gitCredentials;
        } catch (error) {
            ErrorService.log('gitCredentialService.findBy', error);
            throw error;
        }
    },
    create: async function(data) {
        try {
            const { gitUsername, gitPassword, projectId } = data;

            const gitCredential = await this.findOneBy({
                gitUsername,
                projectId,
            });

            if (gitCredential) {
                const error = new Error(
                    'Git Credential already exist in this project'
                );
                error.code = 400;
                ErrorService.log('gitCredentialService.create', error);
                throw error;
            }

            const encryptedPassword = await encrypt(gitPassword);

            const response = GitCredentialModel.create({
                gitUsername,
                gitPassword: encryptedPassword,
                projectId,
            });
            return response;
        } catch (error) {
            ErrorService.log('gitCredentialService.create', error);
            throw error;
        }
    },
};
