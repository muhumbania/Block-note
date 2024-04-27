const filterBtn = document.querySelector('.filter-btn');
const filters = document.querySelector('.filters');
let state = false;
const form = document.getElementById('deleteForm');


filterBtn.addEventListener('click', function(){
    state =! state;

    if(state){
        filters.classList.remove('hidden');
    }else{
        filters.classList.add('hidden');
    }
});

function submitForm(){
    form.submit();
}