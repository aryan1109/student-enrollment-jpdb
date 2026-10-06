(function () {
    "use strict";

    if (window.studentEnrollmentJpdbInitialized) {
        return;
    }

    window.studentEnrollmentJpdbInitialized = true;

const apiBaseUrl = "https://api.login2explore.com:5577";
const irlPartUrl = "/api/irl";
const imlPartUrl = "/api/iml";

const dbName = "SCHOOL-DB";
const relName = "STUDENT-TABLE";

const connToken = "YOUR_CONNECTION_TOKEN";

const $rollNo = $("#rollNo");
const $fullName = $("#fullName");
const $studentClass = $("#studentClass");
const $birthDate = $("#birthDate");
const $address = $("#address");
const $enrollmentDate = $("#enrollmentDate");

const $saveBtn = $("#saveBtn");
const $updateBtn = $("#updateBtn");
const $resetBtn = $("#resetBtn");

let recordNumber = null;
let checkedRollNo = "";
let formMode = "initial";
let requestInProgress = false;

setBaseUrl(apiBaseUrl);

$(document).ready(function () {
    resetForm();

    $rollNo.on("input", function () {
        this.value = this.value.trimStart();

        if (formMode === "new" && this.value.trim() !== checkedRollNo) {
            clearDetails();
            setInitialState(false);
        }
    });

    $rollNo.on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkPrimaryKey();
        }
    });

    $rollNo.on("blur", function () {
        if ($rollNo.val().trim() !== "") {
            checkPrimaryKey();
        }
    });
});

function showMessage(text, type) {
    $("#message")
        .removeClass("success error info")
        .addClass(type || "")
        .text(text);
}

function clearMessage() {
    $("#message").removeClass("success error info").text("");
}

function setDetailsEnabled(enabled) {
    $fullName.prop("disabled", !enabled);
    $studentClass.prop("disabled", !enabled);
    $birthDate.prop("disabled", !enabled);
    $address.prop("disabled", !enabled);
    $enrollmentDate.prop("disabled", !enabled);
}

function clearDetails() {
    $fullName.val("");
    $studentClass.val("");
    $birthDate.val("");
    $address.val("");
    $enrollmentDate.val("");
}

function setInitialState(clearRollNo) {
    if (clearRollNo !== false) {
        $rollNo.val("");
    }

    clearDetails();
    setDetailsEnabled(false);
    $rollNo.prop("disabled", false);
    $saveBtn.prop("disabled", true);
    $updateBtn.prop("disabled", true);
    $resetBtn.prop("disabled", true);
    recordNumber = null;
    checkedRollNo = "";
    formMode = "initial";
    requestInProgress = false;
    $rollNo.focus();
}

function resetForm() {
    clearMessage();
    setInitialState();
}

function validateToken() {
    if (
        !connToken ||
        connToken === "YOUR_CONNECTION_TOKEN" ||
        connToken === "PASTE_YOUR_CONNECTION_TOKEN_HERE"
    ) {
        showMessage("Please add your JsonPowerDB connection token in script.js.", "error");
        return false;
    }
    return true;
}

function executeJpdbRequest(request, apiEndpoint) {
    try {
        $.ajaxSetup({ async: false });
        return executeCommandAtGivenBaseUrl(request, apiBaseUrl, apiEndpoint);
    } catch (error) {
        return {
            status: 0,
            message: error && error.message ? error.message : "Unable to connect to JsonPowerDB."
        };
    } finally {
        $.ajaxSetup({ async: true });
    }
}

function parseJsonValue(value) {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}

function getResponseData(response) {
    return parseJsonValue(response && response.data);
}

function getRollNoKeyValue(value) {
    const rollNo = String(value).trim();

    if (/^(0|[1-9]\d*)$/.test(rollNo) && Number.isSafeInteger(Number(rollNo))) {
        return Number(rollNo);
    }

    return rollNo;
}

function rollNoValuesMatch(firstValue, secondValue) {
    return String(firstValue).trim() === String(secondValue).trim();
}

function getExistingRecord(response) {
    const dataWrapper = getResponseData(response);
    const recordData = parseJsonValue(dataWrapper && dataWrapper.record);
    const recNo =
        dataWrapper && (dataWrapper.rec_no || dataWrapper.recordNumber || dataWrapper.recNo);

    if (!recNo || !recordData) {
        return null;
    }

    return {
        recNo: recNo,
        record: recordData
    };
}

function isMissingRecordResponse(response) {
    if (!response || response.status !== 400) {
        return false;
    }

    const message = String(response.message || "").toLowerCase();
    return (
        message.includes("data not found") ||
        message.includes("no record") ||
        message.includes("records not found") ||
        message.includes("record not found")
    );
}

function getErrorMessage(response, fallbackMessage) {
    if (response && response.message) {
        return response.message;
    }

    return fallbackMessage;
}

function checkPrimaryKey() {
    const rollNo = $rollNo.val().trim();

    if (!rollNo) {
        showMessage("Roll No. is required.", "error");
        $rollNo.focus();
        return false;
    }

    if ((formMode === "new" || formMode === "edit") && rollNo === checkedRollNo) {
        return true;
    }

    if (!validateToken() || requestInProgress) {
        return false;
    }

    requestInProgress = true;
    showMessage("Checking Roll No. in JsonPowerDB...", "info");

    const rollNoKeyValue = getRollNoKeyValue(rollNo);
    const request = createGET_BY_KEYRequest(
        connToken,
        dbName,
        relName,
        JSON.stringify({ "Roll-No": rollNoKeyValue }),
        true,
        true
    );

    const response = executeJpdbRequest(request, irlPartUrl);

    requestInProgress = false;

    const existingRecord = getExistingRecord(response);
    if (response && response.status === 200 && existingRecord) {
        loadExistingRecord(existingRecord);
        return true;
    }

    if (response && response.status === 200) {
        showMessage("GET_BY_KEY succeeded, but the record data was not in the expected JPDB format.", "error");
        $rollNo.focus();
        return false;
    }

    if (isMissingRecordResponse(response)) {
        prepareForNewRecord(rollNo);
        return true;
    }

    showMessage(
        getErrorMessage(response, "Unable to check the record."),
        "error"
    );
    $rollNo.focus();
    return false;
}

function loadExistingRecord(existingRecord) {
    const data = existingRecord.record;
    recordNumber = existingRecord.recNo;

    $rollNo.val(data["Roll-No"] === undefined || data["Roll-No"] === null ? $rollNo.val() : data["Roll-No"]);
    $fullName.val(data["Full-Name"] || "");
    $studentClass.val(data["Class"] || "");
    $birthDate.val(data["Birth-Date"] || "");
    $address.val(data["Address"] || "");
    $enrollmentDate.val(data["Enrollment-Date"] || "");

    checkedRollNo = $rollNo.val().trim();
    formMode = "edit";
    $rollNo.prop("disabled", true);
    setDetailsEnabled(true);
    $saveBtn.prop("disabled", true);
    $updateBtn.prop("disabled", false);
    $resetBtn.prop("disabled", false);

    showMessage("Existing student found. You can update the details.", "info");
    $fullName.focus();
    return true;
}

function prepareForNewRecord(rollNo) {
    recordNumber = null;
    checkedRollNo = rollNo;
    formMode = "new";
    clearDetails();

    setDetailsEnabled(true);
    $rollNo.prop("disabled", false);
    $saveBtn.prop("disabled", false);
    $updateBtn.prop("disabled", true);
    $resetBtn.prop("disabled", false);

    showMessage("New Roll No. found. Enter the student details and click Save.", "success");
    $fullName.focus();
}

function getFormData() {
    return {
        "Roll-No": getRollNoKeyValue($rollNo.val()),
        "Full-Name": $fullName.val().trim(),
        "Class": $studentClass.val().trim(),
        "Birth-Date": $birthDate.val(),
        "Address": $address.val().trim(),
        "Enrollment-Date": $enrollmentDate.val()
    };
}

function validateForm(expectedMode) {
    const data = getFormData();
    const fields = [
        { key: "Roll-No", label: "Roll-No", input: $rollNo },
        { key: "Full-Name", label: "Full-Name", input: $fullName },
        { key: "Class", label: "Class", input: $studentClass },
        { key: "Birth-Date", label: "Birth-Date", input: $birthDate },
        { key: "Address", label: "Address", input: $address },
        { key: "Enrollment-Date", label: "Enrollment-Date", input: $enrollmentDate }
    ];

    if (expectedMode === "new" && formMode !== "new") {
        showMessage("Please enter and check a new Roll-No before saving.", "error");
        $rollNo.focus();
        return false;
    }

    if (expectedMode === "edit" && formMode !== "edit") {
        showMessage("Please retrieve an existing Roll-No before updating.", "error");
        $rollNo.focus();
        return false;
    }

    for (const field of fields) {
        if (!data[field.key]) {
            showMessage(field.label + " is required.", "error");
            field.input.focus();
            return false;
        }
    }

    if (formMode === "new" && !rollNoValuesMatch(data["Roll-No"], checkedRollNo)) {
        showMessage("Please check the current Roll-No before saving.", "error");
        $rollNo.focus();
        return false;
    }

    if (formMode === "edit" && !recordNumber) {
        showMessage("Record number is missing. Please reset and search again.", "error");
        return false;
    }

    return true;
}

function saveData() {
    if (!validateToken() || !validateForm("new") || requestInProgress) {
        return false;
    }

    const data = getFormData();

    requestInProgress = true;

    const request = createPUTRequest(
        connToken,
        JSON.stringify(data),
        dbName,
        relName
    );

    const response = executeJpdbRequest(request, imlPartUrl);

    requestInProgress = false;

    if (response && response.status === 200) {
        resetForm();
        return true;
    }

    showMessage(
        getErrorMessage(response, "Unable to save the record."),
        "error"
    );
    return false;
}

function updateData() {
    if (!validateToken() || !validateForm("edit") || requestInProgress) {
        return false;
    }

    if (!recordNumber) {
        showMessage("Record number is missing. Please reset and search again.", "error");
        return false;
    }

    const data = getFormData();

    requestInProgress = true;

    const request = createUPDATERecordRequest(
        connToken,
        JSON.stringify(data),
        dbName,
        relName,
        recordNumber
    );

    const response = executeJpdbRequest(request, imlPartUrl);

    requestInProgress = false;

    if (response && response.status === 200) {
        resetForm();
        return true;
    }

    showMessage(
        getErrorMessage(response, "Unable to update the record."),
        "error"
    );
    return false;
}

window.resetForm = resetForm;
window.saveData = saveData;
window.updateData = updateData;
}());
