
const initialState = {
    isLoading: false
}

const appState = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_HOME_LOADING_STATE':
            return {
                ...state,
                isLoading: action.isLoading
            };
        default:
            return state
    }
    
}

export default appState;