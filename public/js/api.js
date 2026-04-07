class API {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'API request failed');
            }

          
            return result.data !== undefined ? result.data : result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getEmployees() {
        return this.request('/employees');
    }

    async getEmployee(id) {
        return this.request(`/employees/${id}`);
    }

    async getEmployeesByDepartment(department) {
        return this.request(`/employees/department/${department}`);
    }

    async createEmployee(employeeData) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

    async updateEmployee(id, employeeData) {
        return this.request(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

    async deleteEmployee(id) {
        return this.request(`/employees/${id}`, {
            method: 'DELETE'
        });
    }

    async getDepartments() {
        return this.request('/departments');
    }

    async getDepartment(id) {
        return this.request(`/departments/${id}`);
    }

    async createDepartment(deptData) {
        return this.request('/departments', {
            method: 'POST',
            body: JSON.stringify(deptData)
        });
    }

    async updateDepartment(id, deptData) {
        return this.request(`/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(deptData)
        });
    }

    async deleteDepartment(id) {
        return this.request(`/departments/${id}`, {
            method: 'DELETE'
        });
    }

    async getAttendance() {
        return this.request('/attendance');
    }

    async getAttendanceByEmployee(employeeId) {
        return this.request(`/attendance/employee/${employeeId}`);
    }

    async getAttendanceByDateRange(startDate, endDate) {
        return this.request(`/attendance/date-range?startDate=${startDate}&endDate=${endDate}`);
    }

    async createAttendance(attendanceData) {
        return this.request('/attendance', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    }

    async markAttendance(attendanceData) {
        return this.request('/attendance', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    }

    async updateAttendance(id, attendanceData) {
        return this.request(`/attendance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(attendanceData)
        });
    }

    async deleteAttendance(id) {
        return this.request(`/attendance/${id}`, {
            method: 'DELETE'
        });
    }

    async getPayroll() {
        return this.request('/payroll');
    }

    async getPayrollByEmployee(employeeId) {
        return this.request(`/payroll/employee/${employeeId}`);
    }

    async createPayroll(payrollData) {
        return this.request('/payroll', {
            method: 'POST',
            body: JSON.stringify(payrollData)
        });
    }

    async updatePayroll(id, payrollData) {
        return this.request(`/payroll/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payrollData)
        });
    }

    async deletePayroll(id) {
        return this.request(`/payroll/${id}`, {
            method: 'DELETE'
        });
    }

    async getLeaves() {
        return this.request('/leaves');
    }

    async getLeavesByEmployee(employeeId) {
        return this.request(`/leaves/employee/${employeeId}`);
    }

    async getLeavesByStatus(status) {
        return this.request(`/leaves/status/${status}`);
    }

    async getLeave(id) {
        return this.request(`/leaves/${id}`);
    }

    async createLeave(leaveData) {
        return this.request('/leaves', {
            method: 'POST',
            body: JSON.stringify(leaveData)
        });
    }

    async updateLeave(id, leaveData) {
        return this.request(`/leaves/${id}`, {
            method: 'PUT',
            body: JSON.stringify(leaveData)
        });
    }

    async deleteLeave(id) {
        return this.request(`/leaves/${id}`, {
            method: 'DELETE'
        });
    }
}
