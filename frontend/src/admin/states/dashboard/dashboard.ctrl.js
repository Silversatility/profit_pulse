import UsStates from '../customers/us-states';

export default class DashboardCtrl {

    constructor($scope, dashboardService, userService, customerService, $filter, $compile, $location) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.customerService = customerService;
        this.$location = $location;
        this.profile = {};
        this.topProducts = [];
        this.reports = {};
        this.topCustomers = [];
        this.topPhysicians = [];
        this.allCustomers = [];
        this.totalProfits = [];
        this.filterResource = [
            {
                name: 'Today',
                value: 'today'
            },
            {
                name: 'Yesterday',
                value: 'yesterday'
            },
            {
                name: 'This Week',
                value: 'this_week'
            },
            {
                name: 'Last Week',
                value: 'last_week'
            },
            {
                name: 'This Month',
                value: 'this_month'
            },
            {
                name: 'Last Month',
                value: 'last_month'
            },
            {
                name: 'YTD',
                value: 'year_to_date'
            },
            {
                name: 'LYTD',
                value: 'last_year_to_date'
            },
            {
                name: '3Y',
                value: 'last_3_years'
            }
        ];

        this.filter = {
            name: 'YTD',
            value: 'year_to_date'
        };

        this.totalProfitsChart = {
            labels: [],
            data: [],
            series: ['Profit'],
            datasetOverride: [
                {
                    label: "Profit",
                    borderWidth: 2,
                    borderColor: '#06EDFE',
                    type: 'line',
                    fill: 0.4
                }
            ],
            options: {
                responsive: true,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + "  $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                        }
                    },
                    mode: "x-axis"
                },
                scales: {
                    xAxes: [{
                        barPercentage: 0.5
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, labels) {
                                return '$' + $filter('number')(value, 0);
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

        this.productsChart = {
            labels: [],
            data: [],
            colors: ['#4b7efe', '#56cb97', '#BEFE8F', '#BC85FE', '#06EDFE'],
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index];
                        }
                    }
                }
            }
        };

        this.physiciansChart = {
            labels: [],
            data: [[]],
            series: ['Profit'],
            datasetOverride: [
                {
                    label: "Profit",
                    borderWidth: 1,
                    borderColor: '#06EDFE',
                    backgroundColor: '#06EDFE',
                    type: 'bar'
                }
            ],
            options: {
                responsive: true,
                maintainAspectRatio: true,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + "  $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                        }
                    },
                    mode: "x-axis"
                },
                scales: {
                    xAxes: [{
                        barPercentage: 0.4,
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, labels) {
                                return '$' + $filter('number')(value, 2);
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

        this.vmapCharts = {
            map: 'usa_en',
            backgroundColor: null,
            borderColor: '#000000',
            color: '#ffffff',
            hoverOpacity: 0.7,
            selectedColor: '#666666',
            enableZoom: true,
            showTooltip: true,
            values: {},
            scaleColors: ['#8ff7ff', '#06EDFE'],
            normalizeFunction: 'polynomial'
        };
        this.vmapObject = undefined;
        this.customersChart = {
            labels: [],
            data: [[]],
            series: ['Profit'],
            datasetOverride: [
                {
                    label: "Profit",
                    borderWidth: 1,
                    borderColor: '#06EDFE',
                    backgroundColor: '#06EDFE',
                    type: 'bar'
                }
            ],
            options: {
                responsive: true,
                maintainAspectRatio: true,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + "  $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                        }
                    },
                    mode: "x-axis"
                },
                scales: {
                    xAxes: [{
                        barPercentage: 0.4,
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, labels) {
                                return '$' + $filter('number')(value, 2);
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

        this.credentialingCompletionChart = {
            labels: [],
            data: [[]],
            series: ['Credentialing Completion'],
            datasetOverride: [
                {
                    label: "Credentialing Completion",
                    borderWidth: 1,
                    borderColor: '#06EDFE',
                    backgroundColor: '#06EDFE',
                    type: 'bar'
                }
            ],
            options: {
                responsive: true,
                maintainAspectRatio: true,
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '/18 documents'
                        }
                    },
                      mode: "x-axis"
                },
                scales: {
                    xAxes: [{
                        barPercentage: 0.4,
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, labels) {
                                return ((parseFloat(value) / 18) * 100).toFixed() + " %"
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

        this.calendarOptions = {
            height: 600,
            header: {
                left: 'month basicWeek basicDay agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            }
        };
        this.softwareEvents = {
            color: '#3a87ad',
            events: []
        };
        this.implementEvents = {
            color: '#06EDFE',
            events: []
        };
        this.calendarEvents = [this.softwareEvents, this.implementEvents];

        this.populate();
    }

    populate() {
        this.getUserProfile();
        // this.getTopPerformingProducts();
        this.getTopCustomers();
        this.getAllCustomers();
        this.getDispenseHistoryReport();
        this.getTotalProfits();
        this.getTopPhysicians();
        this.getCustomerCalendar();
    }

    getUserProfile() {
        this.userService.me()
            .then(data => {
                this.profile = data;
                if (this.profile.user.is_customer) {
                  this.$location.path('customerDashboard');
                }
            });
    }

    // getTopPerformingProducts() {
    //     this.dashboardService.getTopPerformingProducts(this.filter.value, true)
    //         .then((data) => {
    //             this.topProducts = [];
    //             this.productsChart.data = [];
    //             this.productsChart.labels = [];
    //
    //             if(data.results.length) {
    //                 for(let i=0; i<5; i++) {
    //                     this.topProducts.push(data.results[i]);
    //                     this.productsChart.data.push(data.results[i].performance_percentage.toFixed(1));
    //                     this.productsChart.labels.push(`${data.results[i].title} - ${data.results[i].performance_percentage.toFixed(1)}%`);
    //                 }
    //             }
    //         });
    // }

    getTopCustomers() {
        this.dashboardService.getTopCustomers(this.filter.value)
            .then((data) => {
                let totalProfit = 0;

                angular.forEach(data, function(result) {
                    totalProfit += result.profit;
                    result.short_name = '';

                    let nameArray = result.business_name.replace('(', '').split(" ");
                    for(let i=0; i<=nameArray.length - 1; i++) {
                        nameArray[i] === '&' ? null : result.short_name += nameArray[i][0];
                    }
                });

                angular.forEach(data, function(result) {
                    result.profit_percent = result.profit / totalProfit * 100;
                });

                this.topCustomers = data;

                this.customersChart.labels = [];
                this.customersChart.data[0] = [];

                let count = this.topCustomers.length < 5 ? this.topCustomers.length : 5;
                for(let i=0; i < count; i++) {
                    this.customersChart.labels.push(data[i].business_name);
                    this.customersChart.data[0].push(data[i].profit);
                }
            });
    }

    getAllCustomers() {
        let self = this;
        let graphData = {};
        let totalGeo = 0;

        this.dashboardService.getAllCustomers(this.filter.value)
            .then((data) => {
                this.allCustomers = data;

                angular.forEach(data, function(customer) {
                    if(customer.state) {
                        totalGeo++;
                        graphData.hasOwnProperty(customer.state.toLowerCase()) ? graphData[customer.state.toLowerCase()]++ : graphData[customer.state.toLowerCase()] = 1;
                    }
                });

                if(totalGeo)
                    angular.forEach(graphData, function(data, key) {
                        graphData[key] = parseInt(data / totalGeo * 1000) / 10;
                    });

                this.vmapCharts.values = graphData;
                this.vmapCharts.scaleColors = ['#ddfdff', '#06EDFE'];

                if(this.vmapObject) {
                    angular.element('#usa_map').empty();
                    angular.element('#usa_map').vectorMap(self.vmapCharts);
                } else {
                    setTimeout(function() {
                        self.vmapObject = angular.element('#usa_map').vectorMap(self.vmapCharts);
                    }, 500);
                }

                // credentialing completion part
                self.credentialingCompletionChart.labels = [];
                self.credentialingCompletionChart.data[0] = [];

                angular.forEach(data, function(customer) {
                  customer.documents_received = 0
                  customer.facility_liability_insurance && customer.documents_received++
                  customer.articles_of_incorporation && customer.documents_received++
                  customer.facility_medicare_and_medicaid_member_id && customer.documents_received++
                  customer.irs_tax_documentation && customer.documents_received++
                  customer.practice_w9 && customer.documents_received++
                  customer.facility_npi && customer.documents_received++
                  customer.professional_liability_policy && customer.documents_received++
                  customer.state_medical_license && customer.documents_received++
                  customer.state_license_verification && customer.documents_received++
                  customer.dea_license && customer.documents_received++
                  customer.home_address && customer.documents_received++
                  customer.npi_number && customer.documents_received++

                  customer.organization_npi && customer.documents_received++
                  customer.ncpdp_number && customer.documents_received++

                  customer.express_scripts && customer.documents_received++
                  customer.psao && customer.documents_received++
                  customer.caremark && customer.documents_received++
                  customer.humana && customer.documents_received++
                  customer.optum && customer.documents_received++

                  self.credentialingCompletionChart.labels.push(customer.business_name);
                  self.credentialingCompletionChart.data[0].push(customer.documents_received);
                });
            });
    }

    getDispenseHistoryReport() {
        this.dashboardService.getDispenseHistoryReport(this.filter.value)
            .then(data => {
                this.reports = data;
            });
    }

    getTotalProfits() {
        this.dashboardService.getTotalProfits(this.filter.value)
            .then(data => {
                this.totalProfits = data;

                this.totalProfitsChart.labels = [];
                this.totalProfitsChart.data[0] = [];

                this.totalProfits.forEach((el) => {
                    let x = Object.keys(el)[0];
                    let y = el[x];
                    this.totalProfitsChart.labels.push(x);
                    this.totalProfitsChart.data[0].push(y);
                });

                if(this.filter.value === 'year_to_date') {
                    let date = new Date();
                    let year = date.getFullYear();
                    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                    months.forEach((month) => {
                        if(this.totalProfitsChart.labels.indexOf(month + " " + year) < 0) {
                            this.totalProfitsChart.labels.push(month + " " + year);
                            this.totalProfitsChart.data[0].push(0);
                        }
                    });
                }
            });
    }

    getTopPhysicians() {
        this.dashboardService.getTopPhysicians(this.filter.value)
            .then(data => {
                this.topPhysicians = data;

                this.physiciansChart.labels = [];
                this.physiciansChart.data[0] = [];

                let count = this.topPhysicians.length < 5 ? this.topPhysicians.length : 5;
                for(let i=0; i < count; i++) {
                    this.physiciansChart.labels.push(data[i].first_name + " " + data[i].last_name);
                    this.physiciansChart.data[0].push(data[i].profit);
                }
            });
    }

    getCustomerCalendar() {
        let self = this;
        this.customerService.calendar()
            .then(data => {
                angular.forEach(data, function(customer) {
                    if(customer.active_date) {
                        self.implementEvents.events.push({
                            title: 'Implementation - ' + customer.business_name,
                            start: moment(customer.active_date).toDate(),
                            allDay: true,
                            stick: true
                        });
                    }

                    if(customer.software_install) {
                        self.softwareEvents.events.push({
                            title: 'Software Install - ' + customer.business_name,
                            start: moment(customer.software_install).toDate(),
                            allDay: true,
                            stick: true
                        });
                    }
                });
            });
    }

    changeFilter(item) {
        this.filter = item;
        this.getDispenseHistoryReport();
        // this.getTopPerformingProducts();
        this.getTopCustomers();
        this.getTotalProfits();
        this.getAllCustomers();
        this.getTopPhysicians();
    }

    getRealState(state) {
        let statesObject = new UsStates();

        return statesObject.states[state.toUpperCase()];
    }

    getNumberFromString(amount) {
        return amount ? Number(amount.replace(/,/g, "")) : 0;
    }
    getGoalPercent(current, goal) {
        let num_current = this.getNumberFromString(current);
        let num_goal = this.getNumberFromString(goal);

        if(num_current && num_goal)
            return parseInt(num_current / num_goal * 100);
        else
            return 0;
    }
}

DashboardCtrl.$inject = ['$scope', 'DashboardService', 'userService', 'customerService', '$filter', '$compile', '$location'];
