export default (data) => '$' + parseFloat(data).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
