import UsStates from '../customers/us-states';

export default class DashboardCtrl {

    constructor(dashboardService, userService, $filter) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.profile = {};
        this.allCustomers = [];
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
                            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '/7 documents'
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
                                return ((parseFloat(value) / 7) * 100).toFixed() + " %"
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
        this.getAllCustomers();
    }

    getUserProfile() {
        this.userService.me()
            .then(data => {
                this.profile = data;
            });
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
                  customer.medical_clinic_license.length > 0 && customer.documents_received++;
                  customer.pic_dea_license.length > 0 && customer.documents_received++;
                  customer.federal_tax_id.length > 0 && customer.documents_received++;
                  customer.business_liability_insurance.length > 0 && customer.documents_received++;
                  customer.professional_liability_insurance.length > 0 && customer.documents_received++;
                  customer.owner_pic_drivers_license.length > 0 && customer.documents_received++;
                  customer.articles_of_incorporation.length > 0 && customer.documents_received++;
                  // customer.facility_liability_insurance && customer.documents_received++
                  // customer.articles_of_incorporation && customer.documents_received++
                  // customer.facility_medicare_and_medicaid_member_id && customer.documents_received++
                  // customer.irs_tax_documentation && customer.documents_received++
                  // customer.practice_w9 && customer.documents_received++
                  // customer.facility_npi && customer.documents_received++
                  // customer.professional_liability_policy && customer.documents_received++
                  // customer.state_medical_license && customer.documents_received++
                  // customer.state_license_verification && customer.documents_received++
                  // customer.dea_license && customer.documents_received++
                  // customer.home_address && customer.documents_received++
                  // customer.npi_number && customer.documents_received++
                  //
                  // customer.organization_npi && customer.documents_received++
                  // customer.ncpdp_number && customer.documents_received++
                  //
                  // customer.express_scripts && customer.documents_received++
                  // customer.psao && customer.documents_received++
                  // customer.caremark && customer.documents_received++
                  // customer.humana && customer.documents_received++
                  // customer.optum && customer.documents_received++

                  self.credentialingCompletionChart.labels.push(customer.business_name);
                  self.credentialingCompletionChart.data[0].push(customer.documents_received);
                });
            });
    }

    changeFilter(item) {
        this.filter = item;
        this.getAllCustomers();
    }

    getRealState(state) {
        let statesObject = new UsStates();
        return statesObject.states[state.toUpperCase()];
    }

}

DashboardCtrl.$inject = ['DashboardService', 'userService', '$filter'];
