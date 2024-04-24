const filterBtn = document.querySelector('.filter-btn');
const filters = document.querySelector('.filters');
let state = false;


filterBtn.addEventListener('click', function(){
    state =! state;

    if(state){
        filters.classList.remove('hidden');
    }else{
        filters.classList.add('hidden');
    }
})