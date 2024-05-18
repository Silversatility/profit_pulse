const DATE_FORMAT = "MMM DD, YYYY";
export default class ProfitabilityCtrl {

    constructor(profitabilityService, userService, dashboardService, $location, $filter) {
        this.profitabilityService = profitabilityService;
        this.userService = userService;
        this.dashboardService = dashboardService;
        this.$location = $location;
        this.filterResource = [
            {
                name: 'Weekly',
                value: 'this_week'
            },
            {
                name: 'Monthly',
                value: 'this_month'
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
            name: 'Weekly',
            value: 'this_week'
        };

        this.profitabilityData=[];
        this.physicianOverview = [];

        this.profitabilityChart= {
            labels: [],
            data: [],
            series: [],
            datasetOverride: [],
            colors: [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
            chart_options: {
                responsive: true,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        fontSize: 14,
                        boxWidth: 15
                    }
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            display: false,
                        },
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            callback: function (value, index, labels) {
                                return '$' + $filter('number')(value, 2);
                            },
                            maxTicksLimit: 10
                        },
                        gridLines: {
                            drawBorder: true,
                        },
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data){
                            return data.datasets[tooltipItem.datasetIndex].label+"  $"+ data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                        }
                    }
                }
            }
        };

        this.filterCustomer = null;
        this.filterCustomers = [];
        this.userService.me().then(data => {
            this.profile = data;
            if (this.profile.user.is_manager) {
                this.filterCustomer = Number(new URLSearchParams(window.location.search).get('customer')) || null;
                this.dashboardService.getCustomers().then(data => {
                    this.filterCustomers = data;
                });
            }
            this.getProfitability();
            this.getPhysicianOverview();
        });
    }

    getProfitability(filter){
        let self = this;

        this.profitabilityService.getProfitability(this.filter.value, this.filterCustomer)
            .then(data => {
                this.profitabilityData = data;

                this.profitabilityChart.labels = [];
                this.profitabilityChart.data = [];
                this.profitabilityChart.datasetOverride = [];
                this.profitabilityChart.series = [];

                this.profitabilityData.forEach(function(el,index){
                    self.profitabilityChart.series.push(el.name);

                    self.profitabilityChart.datasetOverride.push({
                        label: el.name,
                        borderWidth: 0.3,
                        type: 'line'
                    });
                    el.profits.forEach(function (profit, ind) {
                        if (!self.profitabilityChart.labels[ind]) self.profitabilityChart.labels[ind] = Object.keys(profit)[0];
                    });
                });

                self.profitabilityChart.series.forEach(function(label, index) {
                    self.profitabilityChart.data[index] = [];

                    self.profitabilityData.forEach(function(el) {
                        if(label == el.name) {
                            el.profits.forEach(function(profit) {
                                self.profitabilityChart.data[index].push(profit[Object.keys(profit)[0]]);
                            });
                        }
                    })
                });
            })
    }

    getPhysicianOverview(){
        this.profitabilityService.getPhysicianOverview(this.filterCustomer)
            .then(data => {
                this.physicianOverview = data;
            })
    }

    changeFilter(item){
        this.filter = item;
        this.getProfitability();
        this.getPhysicianOverview();
    }
}

ProfitabilityCtrl.$inject = ['profitabilityService', 'userService', 'DashboardService', '$location', '$filter'];
