import UsStates from '../customers/us-states';

export default class DashboardCtrl {

    constructor(dashboardService, userService, $filter) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.totalProfits = [];
        this.allCustomers = [];
        this.topCustomers = [];
        this.topPhysicians = [];
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
            scaleColors: ['#299b85', '#009b6b'],
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
        this.populate();
    }

    populate() {
        this.getUserProfile();
        this.getTotalProfits();
        this.getAllCustomers();
        this.getTopCustomers();
        this.getTopPhysicians();
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

    getUserProfile() {
        this.userService.me()
    }

    getAllCustomers() {
        let self = this;
        let graphData = {};
        let totalGeo = 0;

        this.dashboardService.getAllCustomers(this.filter.value)
            .then((data) => {
                this.allCustomers = data;
                // map part
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
                this.vmapCharts.scaleColors = ['#E6F2F0', '#149B7E'];

                if(this.vmapObject) {
                    angular.element('#usa_map').empty();
                    angular.element('#usa_map').vectorMap(self.vmapCharts);
                } else {
                    setTimeout(function() {
                        self.vmapObject = angular.element('#usa_map').vectorMap(self.vmapCharts);
                    }, 500);
                }

            });
    }

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


    changeFilter(item) {
        this.filter = item;
        this.getTotalProfits();
        this.getAllCustomers();
        this.getTopCustomers();
        this.getTopPhysicians();
    }

    getRealState(state) {
        let statesObject = new UsStates();
        return statesObject.states[state.toUpperCase()];
    }

}

DashboardCtrl.$inject = ['DashboardService', 'userService', '$filter'];
