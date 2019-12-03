const pgp = require('pg-promise')();
var db = pgp('postgres://grbrxjrhauptjn:19388487ac4fc3ef3eeea4094c17e9aa5fd0774510bdd7db513c481c0ea31d41@ec2-174-129-227-51.compute-1.amazonaws.com:5432/d6b3313j3l8qt5?ssl=true');

function getVitalSigns(req, res) {
    db.any(`select vitalsign.an, date, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, name, sos, action
    from treatmenthistory inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee 
    on vitalsign.empid = employee.empid
    where treatmenthistory.dischargedate is null
    order by bednumber, date DESC`)
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
                    message: 'Failed to retrieve vital signs'
                });
        })
}

function getVitalSignByID(req, res) {
    db.any(`select patient.title, patient.name as patientname, patient.surname as patientsurname, vitalsign.an, patient.hn, admitdate, dischargedate, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, employee.name as name, date, sos, action
    from patient inner join treatmenthistory 
	on patient.hn = treatmenthistory.hn
	inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee
    on vitalsign.empid = employee.empid
    where vitalsign.an = '` + req.params.an + `'
    order by date`
    )
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved vitalsign an:' + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve vitalsign an:' +
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
                    message: 'Failed to retrieve condition'
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
                    message: 'Failed to retrieve condition conid:' +
                        req.params.id
                });
        })
}

function insertVitalSigns(req, res, next) {
    console.log(req.body)
    db.none('insert into vitalsign(an, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, empid, remark ,date, sos, action) ' +
        'values(${an}, ${temp}, ${pulse}, ${resp}, ${sbp}, ${dbp}, ${o2sat}, ${eye}, ${verbal}, ${motor}, ${urine}, ${painscore}, ${fallrisk}, ${empid}, ${remark}, ${date}, ${sos}, ${action})',
        req.body)
        .then(function (data) {
            var vs = ['temp', 'pulse', 'resp', 'sbp', 'dbp', 'o2sat', 'eye', 'verbal', 'motor', 'urine', 'painscore', 'fallrisk', 'remark', 'action']
            const updatedData = {
                bednumber: req.body.bednumber, status: [
                    { temp: false, data: req.body.temp },
                    { pulse: false, data: req.body.pulse },
                    { resp: false, data: req.body.resp },
                    { sbp: false, data: req.body.sbp },
                    { dbp: false, data: req.body.dbp },
                    { o2sat: false, data: req.body.o2sat },
                    { eye: false, data: req.body.eye },
                    { verbal: false, data: req.body.verbal },
                    { motor: false, data: req.body.motor },
                    { urine: false, data: req.body.urine },
                    { painscore: false, data: req.body.painscore },
                    { fallrisk: false, data: req.body.fallrisk },
                    { remark: false, data: req.body.remark },
                    { action: false, data: req.body.action }
                ]
            }
            console.log(updatedData.status[0][vs[0]]);
            console.log('req.body[vs[0]]', req.body[vs[0]]);

            for (var i = 0; i < vs.length - 1; i++) {
                console.log('req.body[vs[i]]', req.body[vs[i]]);
                console.log('updatedData.status[0][vs[i]]', updatedData.status[0][vs[i]]);
                console.log('updatedData.status[0][vs[i]]', updatedData.status[11][vs[i]]);
                if (req.body[vs[i]] != null) {
                    updatedData.status[i][vs[i]] = true
                    if (req.body.fallrisk == 0 && i == 11) {
                        updatedData.status[11].fallrisk = false
                    }
                }
            }
            req.data = updatedData;
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Inserted vital sign successfully'
                });
            next();

        })
        .catch(function (error) {
            res.status(401)
                .json({
                    status: 'error',
                    message: error.message
                });
            console.log('ERROR:', error)
        });
}

function getBedNumber(req, res) {
    db.any(`select treatmenthistory.an, bednumber, max(date)
    from vitalsign right join treatmenthistory
    on vitalsign.an = treatmenthistory.an
    where dischargedate is null
    group by treatmenthistory.an, treatmenthistory.bednumber
    order by bednumber`)
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
                    message: 'Failed to retrieve bed number'
                });
        })
}

function getBedInfo(req, res) {
    db.any(`select patient.hn, treatmenthistory.an, title, name, surname, dob, admitdate, bednumber
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    where treatmenthistory.an = '` + req.params.an + `'
    group by patient.hn, treatmenthistory.an
	limit 1`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved bed infomation of an:' + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve bed infomation of an:' +
                        req.params.an
                });
        })
}

function getLastestVS(req, res) {
    db.any(`select bednumber,patient.title, patient.name, patient.surname, max(date), 
                employee.title as emptitle, employee.name as empname, 
                employee.surname as empsurname,
                (select temp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and temp is not null
                order by date desc limit 1) as temp,
                (select pulse 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and pulse is not null
                order by date desc limit 1) as pulse,
                (select resp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and resp is not null
                order by date desc limit 1) as resp,
                (select sbp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and sbp is not null
                order by date desc limit 1) as sbp,
                (select dbp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber
                and vitalsign.an = '`+ req.params.an + `'
                and dbp is not null
                order by date desc limit 1) as dbp,
                (select o2sat 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and o2sat is not null
                order by date desc limit 1) as o2sat,
                (select eye 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and eye is not null
                order by date desc limit 1) as eye,
                (select verbal 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and verbal is not null
                order by date desc limit 1) as verbal,
                (select motor 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and motor is not null
                order by date desc limit 1) as motor,
                (select urine 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and urine is not null
                order by date desc limit 1) as urine,
                (select painscore 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and painscore is not null
                order by date desc limit 1) as painscore,
                (select fallrisk 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and fallrisk is not null
                order by date desc limit 1) as fallrisk,
                (select remark 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.an + `'
                and remark is not null
                order by date desc limit 1) as remark
            from patient inner join treatmenthistory
            on patient.hn = treatmenthistory.hn
            inner join vitalsign
            on treatmenthistory.an = vitalsign.an
            inner join employee
            on vitalsign.empid = employee.empid
            where treatmenthistory.an = '`+ req.params.an + `'
            group by bednumber, patient.title, patient.name, patient.surname, 
            employee.title, employee.name, employee.surname`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved lastest vital sign of an:' + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve lastest vital sign of an:' +
                        req.params.an
                });
        })
}

function getpatientInformation(req, res) {
    db.any(`select bednumber, an, patient.hn, title, name, surname, dob, admitdate, dischargedate
    from treatmenthistory inner join patient
    on treatmenthistory.hn = patient.hn
    where an = '` + req.params.an + `'`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved patient infomation of an:' + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve patient infomation of an:' +
                        req.params.an
                });
        })
}
function insertpatient(req, res) {
    db.none('insert into patient(hn, title, name, surname, dob) values(${hn}, ${title}, ${name}, ${surname}, ${dob})', req.body)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Inserted new patient to table patient'
                });
            db.none('insert into treatmenthistory( bednumber, an, hn, admitdate ) values(${bednumber}, ${an}, ${hn}, ${admitdate})',
                req.body)
                .then(function (data) {
                    res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Inserted new patient to table treatmenthistory'
                        });
                })
                .catch(function (error) {
                    console.log('ERROR:', error)
                });
        })
        .catch(function (error) {
            console.log('ERROR:', error)
        });
}

function updatepatient(req, res) {
    console.log(req.params.an);
    console.log(JSON.stringify(req.body));

    db.none("update treatmenthistory set an=${an}, admitdate=${admitdate}, hn=${hn}, bednumber=${bednumber}" + "where an= '" + req.params.an + "'", req.body)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: "Updated patient's information in table treatmenthistory successfully"
                });
            db.none("update patient set hn=${hn}, title=${title}, name=${name}, surname=${surname}, dob=${dob}" + "where hn= '" + req.body.hn + "'", req.body)
                .then(function (data) {
                    console.log("data", data);
                    res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: "Updated patient's information in table patient successfully"
                        });
                })
                .catch(function (error) {
                    console.log('ERROR:', error)
                });
        })
        .catch(function (error) {
            console.log('ERROR:', error)
        });
}

// function deletepatient(req, res) {
//     db.none("delete from treatmenthistory " + "where an= '" + req.params.an + "'", req.body)
//         .then(function (data) {

//             db.none("delete from patient" + "where hn= '" + req.body.hn + "'", req.body)
//                 .then(function (data2) {
//                     console.log("data2", data2);
//                     res.status(200)
//                         .json({
//                             status: 'success',
//                             data: data, data2,
//                             message: 'Update success'
//                         });
//                 })
//                 .catch(function (error) {
//                     console.log('ERROR:', error)
//                 });
//         })
//         .catch(function (error) {
//             console.log('ERROR:', error)
//         });
// }

function updatedischarge(req, res) {

    db.none("update treatmenthistory set dischargedate=${dischargedate}" + "where an= '" + req.params.an + "'", req.body)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: "Updated discharge date successfully"
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to update discharge date'
                });
        })




}
function getlasttemp8vitalsign(req, res) {
    db.any(`select temp, date
    from vitalsign 
    where an = '` + req.params.an + `'
    and temp is not null
    order by date desc
    limit 8`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: "Retrieved temp lastest  8 vital sign" + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: "Failed to retrieve temp lastest 8 vital sign" + req.params.an
                });
        })
}

function getlastpulse8vitalsign(req, res) {
    db.any(`select pulse, date
    from vitalsign 
    where an = '` + req.params.an + `'
    and pulse is not null
    order by date desc
    limit 8`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: "Retrieved pulse lastest  8 vital sign" + req.params.an
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: "Failed to retrieve pulse lastest 8 vital sign" + req.params.an
                });
        })
}


function getdischargepatient(req, res) {
    db.any(`select distinct patient.hn, title, name, surname
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    where dischargedate is not null`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: "Retrieved discharged patients"
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve discharged patients'
                });
        })
}

function getadmithistory(req, res) {
    db.any(`select an, title, name, surname, admitdate, dischargedate
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    where dischargedate is not null
    and treatmenthistory.hn = '` + req.params.hn + `'`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved admited history of hn:' + req.params.hn
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve admited history of hn:' + req.params.hn
                });
        })
}

function getpatient(req, res) {
    db.any(`select bednumber,an,patient.hn,title,name,surname,dischargedate
    from treatmenthistory,patient
    where treatmenthistory.hn = patient.hn
    and dischargedate is null
    order by bednumber`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved patient list'
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve patient list'
                });
        })
}

function getscore(req, res) {
    db.any(`select * from score`)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved score'
                });
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to retrieve score'
                });
        })
}

function checklogin(req, res) {
    db.any("select empid, name from employee where username = $1 and password = $2", [req.body.username, req.body.password])
        .then(function (data) {
            if(data.length){
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'login success'
                });
            } else {
                res.status(200)
                .json({
                    data: data,
                    status: 'failed',
                    message: 'Username or password is incorrect'
                });
            }
        })
        .catch(function (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to login'
                });
            console.log(error);
                
        })
}


module.exports = {
    getVitalSigns,
    getVitalSignByID,
    getCondition,
    getConditionByID,
    insertVitalSigns,
    getBedNumber,
    getBedInfo,
    getLastestVS,
    getpatientInformation,
    getscore,
    getpatient,
    insertpatient,
    updatepatient,
    // deletepatient,
    getdischargepatient,
    getadmithistory,
    updatedischarge,
    getlasttemp8vitalsign,
    getlastpulse8vitalsign,
    checklogin
}