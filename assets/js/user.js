const root = document.querySelector('#root');
const {userId, userName} = root.dataset;

export const user = {
    id: userId,
    username: userName,
    avatar: `https://randomuser.me/api/portraits/men/${userId}.jpg`
}
