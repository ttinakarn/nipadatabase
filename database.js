const pgp = require('pg-promise')();
var db = pgp('postgres://grbrxjrhauptjn:19388487ac4fc3ef3eeea4094c17e9aa5fd0774510bdd7db513c481c0ea31d41@ec2-174-129-227-51.compute-1.amazonaws.com:5432/d6b3313j3l8qt5?ssl=true');

function getVitalSigns(req, res) {
    db.any(`select vitalsign.an, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, name
    from treatmenthistory inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee 
    on vitalsign.empid = employee.empid
    order by bednumber`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved vital signs'
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved vital signs'
                });
        })
}

function getVitalSignByID(req, res) {
    db.any(`select vitalsign.an, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, name, date
    from treatmenthistory inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee 
    on vitalsign.empid = employee.empid
    where vitalsign.an = '` + req.params.id + `'
    order by bednumber`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved vitalsign an:' + req.params.id
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved vitalsign vsid:' +
                        req.params.id
                });
        })
}

function getCondition(req, res) {
    db.any('select * from condition order by conid')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved condition'
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved condition'
                });
        })
}

function getConditionByID(req, res) {
    db.any('select * from condition where conid =' + req.params.id)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved condition conid:' + req.params.id
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to condition conid:' +
                        req.params.id
                });
        })
}

function insertVitalSigns(req, res) {
    console.log(req.body)
    db.none('insert into vitalsign(an, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, empid, remark ,date) ' +
        'values(${an}, ${temp}, ${pulse}, ${resp}, ${sbp}, ${dbp}, ${o2sat}, ${eye}, ${verbal}, ${motor}, ${urine}, ${painscore}, ${fallrisk}, ${empid}, ${remark}, ${date})',
        req.body)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted one vitalsign'
                });
        })
        .catch(function (error) {
            res.status(401)
                .json({
                    status: 'error',
                    message: error.message
                });
            console.log('ERROR:', error)
        })
}

function getBedNumber(req, res) {
    db.any(`select vitalsign.an, bednumber, max(date)
    from vitalsign inner join treatmenthistory
    on vitalsign.an = treatmenthistory.an
    group by bednumber, vitalsign.an`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved bed number'
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved  bed number'
                });
        })
}

function getBedInfo(req, res) {
    db.any(`select patient.hn, treatmenthistory.an, title, name, surname, dob, admitdate, max(remark)
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    inner join vitalsign
    on treatmenthistory.an = vitalsign.an
    where treatmenthistory.an = '` + req.params.id + `'
    group by patient.hn, treatmenthistory.an`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved bed infomation of an:' + req.params.id
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved bed infomation of an:' +
                        req.params.id
                });
        })
}

function getLastestVS(req, res) {
    db.any(`select patient.title, patient.name, patient.surname, max(remark) as remark, max(date) as date, employee.title as emptitle, employee.name as empname, employee.surname as empsurname
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    inner join vitalsign
    on treatmenthistory.an = vitalsign.an
	inner join employee
	on vitalsign.empid = employee.empid
    where treatmenthistory.an = '`+ req.params.id +`'
    group by patient.hn, treatmenthistory.an, date, employee.empid`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved bed infomation of an:' + req.params.id
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieved bed infomation of an:' +
                        req.params.id
                });
        })
}

// function updatevitalsign(req, res) {
//         db.none('update vitalsign set an=${an}, temp=${temp}, pulse=${pulse}, resp=${resp}, pulse=${pulse}, sbp=${sbp}, pulse=${pulse}, dbp=${dbp}, o2sat=${o2sat}, eye=${eye}, verbal=${verbal}, motor=${motor}, urine=${urine}, painscore=${painscore}, fallrisk=${fallrisk}, remark=${remark}, eye=${eye}, date=${date}' +
//         'where id=' + req.params.id, req.body)
//             .then(function (data) {
//                 res.status(200)
//                     .json({
//                         status: 'success',
//                         message: 'Updated vitalsign'
//                     });
//             })
//             .catch(function (error) {
//                 console.log('ERROR:', error)
//             })
//     }

// function getAllProducts(req, res) {
//     db.any('select * from products')
//         .then(function (data) {
//             res.status(200)
//                 .json({
//                     status: 'success',
//                     data: data,
//                     message: 'Retrieved ALL products'
//                 });
//         })
//         .catch(function (error) {
//             console.log(error);
//             res.status(500)
//                 .json({
//                     status: 'failed',
//                     message: 'Failed to retrieved ALL products'
//                 });
//         })
// }

// function getProductByID(req, res) {
//     db.any('select * from products where id =' + req.params.id)
//         .then(function (data) {
//             res.status(200)
//                 .json({
//                     status: 'success',
//                     data: data,
//                     message: 'Retrieved products id:' + req.params.id
//                 });
//         })
//         .catch(function (error) {
//             res.status(500)
//                 .json({
//                     status: 'failed',
//                     message: 'Failed to retrieved products id:' +
//                         req.params.id
//                 });
//         })
// }

// function insertProduct(req, res) {
//     db.none('insert into products(id, title, price, created_at, tags)' +
//         'values(${id}, ${title}, ${price}, ${created_at}, ${tags})',
//         req.body)
//         .then(function (data) {
//             res.status(200)
//                 .json({
//                     status: 'success',
//                     message: 'Inserted one product'
//                 });
//         })
//         .catch(function (error) {
//             console.log('ERROR:', error)
//         })
// }

// function updateProduct(req, res) {
//     db.none('update products set title=${title}, price=${price}, tags=${tags} ' +
//     'where id=' + req.params.id, req.body)
//         .then(function (data) {
//             res.status(200)
//                 .json({
//                     status: 'success',
//                     message: 'Updated product'
//                 });
//         })
//         .catch(function (error) {
//             console.log('ERROR:', error)
//         })
// }

module.exports = {
    getVitalSigns,
    getVitalSignByID,
    getCondition,
    getConditionByID,
    insertVitalSigns,
    getBedNumber,
    getBedInfo,
    getLastestVS
}