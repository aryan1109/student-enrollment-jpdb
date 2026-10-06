# Student Enrollment Form - JsonPowerDB Micro Project

## Description

A simple Student Enrollment Form built with HTML, CSS, JavaScript, jQuery and JsonPowerDB. The form uses `Roll-No` as the primary key to check whether a student already exists, save new student records, and update existing records.

This project was created for the Login2Xplore JsonPowerDB micro project assignment.

## Database Configuration

- Database: `SCHOOL-DB`
- Relation: `STUDENT-TABLE`
- Primary Key: `Roll-No`

## Input Fields

- Roll-No
- Full-Name
- Class
- Birth-Date
- Address
- Enrollment-Date

## Features

1. On page load, only Roll-No is enabled.
2. Entering an unused Roll-No enables the remaining fields and Save.
3. Entering an existing Roll-No retrieves the record from JsonPowerDB.
4. Existing records can be modified using Update.
5. Reset returns the form to its initial state.
6. Empty fields are validated before Save/Update.

## Benefits of using JsonPowerDB

- Simple to use with frontend JavaScript.
- Fast primary-key based record lookup.
- Lightweight REST API for insert, retrieve, and update operations.
- Schema-flexible JSON document storage.
- Useful for small web projects and prototypes without writing backend code.

## Setup

1. Open `script.js`.
2. Replace:

`YOUR_CONNECTION_TOKEN`

with your JsonPowerDB connection token.
3. Make sure your JPDB database is `SCHOOL-DB` and relation is `STUDENT-TABLE`.
4. Open the project in NetBeans as a web project, then run `index.html`.
5. Test with a new Roll-No, save it, then enter the same Roll-No again to test Update.

## Testing

### New Roll-No -> Save

1. Run the project.
2. Enter a Roll-No that does not exist in `SCHOOL-DB / STUDENT-TABLE`.
3. Press Enter or move out of the Roll-No field.
4. Complete every field.
5. Click Save.
6. The record is inserted with `PUT`, and the form returns to the initial empty state.

### Existing Roll-No -> Update

1. Enter a Roll-No that already exists.
2. Press Enter or move out of the Roll-No field.
3. The existing JPDB record is loaded with `GET_BY_KEY`.
4. Edit one or more enabled fields.
5. Click Update.
6. The record is updated with `UPDATE`, using the JPDB record number returned by lookup.

## GitHub Publishing

1. Keep these files in the repository root or inside the NetBeans web folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
2. Commit the files.
3. Push the repository to GitHub.
4. Do not commit your real JPDB connection token.

## JPDB APIs Used

- `GET_BY_KEY` - checks whether Roll-No already exists.
- `PUT` - inserts a new student record.
- `UPDATE` - updates an existing student record.

## Release History

- 1.0.0 - Initial release of Student Enrollment Form with Save, Update, Reset, mandatory validation, and JsonPowerDB integration.

## Project Structure

student-enrollment-jpdb/
- index.html
- style.css
- script.js
- README.md
