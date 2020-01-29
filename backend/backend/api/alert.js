/**
 * 
 * Copyright HackerBay, Inc. 
 * 
 */

var express = require('express');
var alertService = require('../services/alertService');
var alertChargeService = require('../services/alertChargeService');
var path = require('path');
var fs = require('fs');

var router = express.Router();
const {
    isAuthorized
} = require('../middlewares/authorization');
var getUser = require('../middlewares/user').getUser;
var getSubProjects = require('../middlewares/subProject').getSubProjects;
var isUserOwner = require('../middlewares/project').isUserOwner;

var sendErrorResponse = require('../middlewares/response').sendErrorResponse;
var sendListResponse = require('../middlewares/response').sendListResponse;
var sendItemResponse = require('../middlewares/response').sendItemResponse;

router.post('/:projectId', getUser, isAuthorized, async function (req, res) {
    try {
        var projectId = req.params.projectId;
        var userId = req.user.id;
        var data = req.body;
        data.projectId = projectId;
        var alert = await alertService.create(projectId, data.monitorId, data.alertVia, userId, data.incidentId);
        return sendItemResponse(req, res, alert);
    } catch(error) {
        return sendErrorResponse(req, res, error);
    }
});

// Fetch alerts by projectId
router.get('/:projectId', getUser, isAuthorized, getSubProjects, async function (req, res) {
    try {
        var subProjectIds = req.user.subProjects ? req.user.subProjects.map(project => project._id) : null;
        var alerts = await alertService.getSubProjectAlerts(subProjectIds);
        return sendItemResponse(req, res, alerts); // frontend expects sendItemResponse
    } catch(error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/alert', getUser, isAuthorized, async function (req, res) {
    try {
        var projectId = req.params.projectId;
        var alerts = await alertService.findBy({ projectId }, req.query.skip || 0, req.query.limit || 10);
        var count = await alertService.countBy({ projectId });
        return sendListResponse(req, res, alerts, count); // frontend expects sendListResponse
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/incident/:incidentId', getUser, isAuthorized, async function (req, res) {
    try {
        var incidentId = req.params.incidentId;
        var skip = req.query.skip || 0;
        var limit = req.query.limit || 10;
        var alerts = await alertService.findBy({incidentId:incidentId }, skip, limit);
        var count = await alertService.countBy({incidentId: incidentId});
        return sendListResponse(req, res, alerts,  count);
    } catch(error) {
        return sendErrorResponse( req, res, error);
    }
});

// Mark alert as viewed
router.get('/:projectId/:alertId/viewed', async function (req, res) {
    try {
        const alertId = req.params.alertId;
        const projectId = req.params.projectId;
        await alertService.updateOneBy({ _id: alertId, projectId: projectId }, {alertStatus: 'Viewed'});
        var filePath = path.join(__dirname, '..', '..', 'views', 'img', 'Fyipe-Logo.png');
        var img = fs.readFileSync(filePath);

        res.set('Content-Type', 'image/png');
        res.status(200);
        res.end(img, 'binary');
    } catch(error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/:projectId', getUser, isUserOwner, async function(req, res){
    try {
        var projectId = req.params.projectId;
        var userId = req.user.id;
        var alert = await alertService.deleteBy({projectId: projectId}, userId);
        return sendItemResponse(req, res, alert);
    } catch(error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/:projectId/alert/charges', getUser, isAuthorized, async function(req, res) {
    try {
        var projectId = req.params.projectId;
        var alertCharges = await alertChargeService.findBy({ projectId }, req.query.skip , req.query.limit );
        var count = await alertChargeService.countBy({ projectId });
        return sendListResponse(req, res, alertCharges, count);
    } catch(error){
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;