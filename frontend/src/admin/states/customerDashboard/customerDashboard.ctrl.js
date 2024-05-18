export default class CustomerDashboardCtrl {
    constructor(customerDashboardService, userService, $filter, $location) {
        this.customerDashboardService = customerDashboardService;
        this.userService = userService;
        this.$location = $location;

        this.reports = {};
        this.topPhysicians=[];
        this.myTopProducts=[];
        this.topProducts=[];
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
            series: ['Revenue'],
            datasetOverride: [
                {
                    label: "Revenue",
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

        this.myProductsChart = {
            labels: [],
            data: [],
            colors: ['#4b7efe','#56cb97', '#befe8f', '#befe8f', '#06edfe', '#7c825e', '#c5b0be', '#922498', '#421bb5', '#d8b3b9'],
            options: {
                responsive: true,
                legend: {
                    display: false,
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data){
                            return data.labels[tooltipItem.index];

                        }
                    }
                }
            }
        };

        this.productsChart = {
            labels: [],
            data: [],
            colors: ['#4b7efe','#56cb97', '#befe8f', '#befe8f', '#06edfe', '#7c825e', '#c5b0be', '#922498', '#421bb5', '#d8b3b9'],
            options: {
                responsive: true,
                legend: {
                    display: false,
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data){
                            return data.labels[tooltipItem.index];
                        }
                    }
                }
            }
        };

        this.profitabilityChart = {
            labels: [],
            data: [[]],
            series: ['Margin'],
            datasetOverride: [
                {
                    label: "Margin",
                    borderWidth: 1,
                    borderColor: '#06EDFE',
                    backgroundColor: '#06EDFE',
                    type: 'bar'
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
                        barPercentage: 0.4,
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, labels) {
                                return '$' + $filter('number')(value, 0);
                            },
                            beginAtZero: true,
                        }
                    }]
                }
            }
        };

        this.filterCustomer = null;
        this.filterCustomers = [];
        this.profile = {};
        this.userService.me().then(data => {
            this.profile = data;
            if (this.profile.user.is_manager) {
                this.filterCustomer = Number(this.$location.search().customer) || null;
                this.customerDashboardService.getCustomers().then(data => {
                    this.filterCustomers = data;
                });
            }
            this.populate();
        });
    }

    populate() {
        this.getDispenseHistoryReport();
        this.drawMyTopPerformingChart();
        this.drawTopPerformingChart();
        this.drawProfitabilityChart();
        this.getNetProfits();
    }

    getDispenseHistoryReport(){
        this.customerDashboardService.getDispenseHistoryReport(this.filter.value, this.filterCustomer)
            .then(data => {
                this.reports = data;
                this.revenueSum = Number(data.total_paid.replace(/,/g, "")) + +Number(data.margin.replace(/,/g, "")) + +Number(data.maintenance_fees.replace(/,/g, "")) + +Number(data.net_profit.replace(/,/g, ""));
            });
    }

    getNetProfits() {
        this.customerDashboardService.getTotalProfits(this.filter.value, this.filterCustomer)
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

    drawTopPerformingChart() {
        let self = this;

        // Don't use this.filterCustomer because the data is supposed to be global anyway
        this.customerDashboardService.getTopPerformingProducts(this.filter.value)
            .then((data) => {
                this.topProducts = [];
                this.productsChart.data = [];
                this.productsChart.labels = [];

                if(data.results.length) {
                    for(let i=0; i<5; i++) {
                        this.topProducts.push(data.results[i]);
                        this.productsChart.data.push(data.results[i].performance_percentage.toFixed(1));
                        this.productsChart.labels.push(`${data.results[i].title} - ${data.results[i].performance_percentage.toFixed(1)}%`);
                    }
                }
            });
    }

    drawMyTopPerformingChart() {
        let self = this;

        this.customerDashboardService.getMyTopPerformingProducts(this.filter.value, this.filterCustomer)
            .then((data) => {
                this.myTopProducts = data;

                this.myProductsChart.data = [];
                this.myProductsChart.labels = [];

                this.myTopProducts.forEach(function(el){
                    self.myProductsChart.data.push(el.performance_percentage.toFixed(1));
                    self.myProductsChart.labels.push(el.rank + ". " + el.title + ` (${el.ndc})`);
                });
            });
    }

    drawProfitabilityChart() {
        let self = this;

        this.customerDashboardService.getPhysiciansTop(this.filter.value, this.filterCustomer)
            .then((data) => {
                this.topPhysicians = data;

                this.profitabilityChart.data[0] = [];
                this.profitabilityChart.labels = [];

                this.topPhysicians.forEach(function (el) {
                    self.profitabilityChart.data[0].push(el.profit);
                    self.profitabilityChart.labels.push(el.first_name + ' ' + el.last_name);
                });
            })
    }

    changeFilter(item) {
        this.filter = item;
        this.onFilter();
    }

    onFilter() {
        this.filterCustomer && this.$location.search({customer: this.filterCustomer});
        this.getDispenseHistoryReport();
        this.drawMyTopPerformingChart();
        this.drawTopPerformingChart();
        this.drawProfitabilityChart();
        this.getNetProfits();
    }

    getNumberFromString(amount) {
        return amount ? Number(amount.replace(/,/g, "")) : 0;
    }
}

CustomerDashboardCtrl.$inject = ['CustomerDashboardService', 'userService', '$filter', '$location'];
