const pgp = require('pg-promise')();
var db = pgp('postgres://grbrxjrhauptjn:19388487ac4fc3ef3eeea4094c17e9aa5fd0774510bdd7db513c481c0ea31d41@ec2-174-129-227-51.compute-1.amazonaws.com:5432/d6b3313j3l8qt5?ssl=true');

function getVitalSigns(req, res) {
    db.any(`select vitalsign.an, date, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, name
    from treatmenthistory inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee 
    on vitalsign.empid = employee.empid
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
                    message: 'Failed to retrieved vital signs'
                });
        })
}

function getVitalSignByID(req, res) {
    db.any(`select patient.title, patient.name as patientname, patient.surname as patientsurname, vitalsign.an, patient.hn, bednumber, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, remark, employee.name as name, date
    from patient inner join treatmenthistory 
	on patient.hn = treatmenthistory.hn
	inner join vitalsign
    on vitalsign.an = treatmenthistory.an
    inner join employee
    on vitalsign.empid = employee.empid
    where vitalsign.an = '` + req.params.id + `'
    order by date`
    )
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

function insertVitalSigns(req, res, next) {
    console.log(req.body)
    db.none('insert into vitalsign(an, temp, pulse, resp, sbp, dbp, o2sat, eye, verbal, motor, urine, painscore, fallrisk, empid, remark ,date) ' +
        'values(${an}, ${temp}, ${pulse}, ${resp}, ${sbp}, ${dbp}, ${o2sat}, ${eye}, ${verbal}, ${motor}, ${urine}, ${painscore}, ${fallrisk}, ${empid}, ${remark}, ${date})',
        req.body)
        .then(function (data) {
            var vs = ['temp', 'pulse', 'resp', 'sbp', 'dbp', 'o2sat', 'eye', 'verbal', 'motor', 'urine', 'painscore', 'fallrisk', 'remark']
            const updatedData = {
                bednumber: req.body.bednumber, status: [
                    { temp: false },
                    { pulse: false },
                    { resp: false },
                    { sbp: false },
                    { dbp: false },
                    { o2sat: false },
                    { eye: false },
                    { verbal: false },
                    { motor: false },
                    { urine: false },
                    { painscore: false },
                    { fallrisk: false },
                    { remark: false },
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
                    message: 'Inserted one vitalsign'
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
    db.any(`select vitalsign.an, bednumber, max(date)
    from vitalsign inner join treatmenthistory
    on vitalsign.an = treatmenthistory.an
    group by bednumber, vitalsign.an
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
                    message: 'Failed to retrieved  bed number'
                });
        })
}

function getBedInfo(req, res) {
    // db.any(`select patient.hn, treatmenthistory.an, title, name, surname, dob, admitdate, max(remark)
    // from patient inner join treatmenthistory
    // on patient.hn = treatmenthistory.hn
    // inner join vitalsign
    // on treatmenthistory.an = vitalsign.an
    // where treatmenthistory.an = '` + req.params.id + `'
    // group by patient.hn, treatmenthistory.an`)
    db.any(`select patient.hn, treatmenthistory.an, title, name, surname, dob, admitdate, last_value(remark) over (order by remark) as max
    from patient inner join treatmenthistory
    on patient.hn = treatmenthistory.hn
    inner join vitalsign
    on treatmenthistory.an = vitalsign.an
    where treatmenthistory.an = '` + req.params.id + `'
    group by patient.hn, treatmenthistory.an, remark
	limit 1`)
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

function getpatient(req, res){

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
                message: 'success to getpatient' 
            });
    })
    .catch(function (error) {
        console.log(error);
        res.status(500)
            .json({
                status: 'failed',
                message: 'Failed to getpatient' 
            });
    })

    }


function getpatientInformation(req, res){

db.any(`select bednumber,an,patient.hn,title,name,surname,dob,admitdate,dischargedate
from treatmenthistory,patient`)

.then(function (data) {
    res.status(200)
        .json({
            status: 'success',
            data: data,
            message: 'success to getpatient' + req.params.an
        });
})
.catch(function (error) {
    console.log(error);
    res.status(500)
        .json({
            status: 'failed',
            message: 'Failed to getpatient' + req.params.an
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
                    message: 'success to getscore'
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'Failed to getscore'
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
                and vitalsign.an = '`+ req.params.id + `'
                and temp is not null
                order by date desc limit 1) as temp,
                (select pulse 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and pulse is not null
                order by date desc limit 1) as pulse,
                (select resp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and resp is not null
                order by date desc limit 1) as resp,
                (select sbp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and sbp is not null
                order by date desc limit 1) as sbp,
                (select dbp 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber
                and vitalsign.an = '`+ req.params.id + `'
                and dbp is not null
                order by date desc limit 1) as dbp,
                (select o2sat 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and o2sat is not null
                order by date desc limit 1) as o2sat,
                (select eye 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and eye is not null
                order by date desc limit 1) as eye,
                (select verbal 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and verbal is not null
                order by date desc limit 1) as verbal,
                (select motor 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and motor is not null
                order by date desc limit 1) as motor,
                (select urine 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and urine is not null
                order by date desc limit 1) as urine,
                (select painscore 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and painscore is not null
                order by date desc limit 1) as painscore,
                (select fallrisk 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and fallrisk is not null
                order by date desc limit 1) as fallrisk,
                (select remark 
                from vitalsign inner join treatmenthistory
                on vitalsign.an = treatmenthistory.an 
                where bednumber = treatmenthistory.bednumber 
                and vitalsign.an = '`+ req.params.id + `'
                and remark is not null
                order by date desc limit 1) as remark
            from patient inner join treatmenthistory
            on patient.hn = treatmenthistory.hn
            inner join vitalsign
            on treatmenthistory.an = vitalsign.an
            inner join employee
            on vitalsign.empid = employee.empid
            where treatmenthistory.an = '`+ req.params.id + `'
            group by bednumber, patient.title, patient.name, patient.surname, 
            employee.title, employee.name, employee.surname`)
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
    getpatient

}