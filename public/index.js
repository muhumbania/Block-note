const filterBtn = document.querySelector('.filter-btn');
const filters = document.querySelector('.filters');
let state = false;
const deleteForm = document.getElementById('deleteForm');


filterBtn.addEventListener('click', function(){
    state =! state;

    if(state){
        filters.classList.remove('hidden');
    }else{
        filters.classList.add('hidden');
    }
});

function deleteNote(){
    deleteForm.submit();
}