export const numberFormat = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
export const dateFormat = (timestampStr) => {
	const dateObj = new Date(timestampStr);

	const day = dateObj.getDate().toString().padStart(2, "0");
	const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
	const year = dateObj.getFullYear();
	const hours = dateObj.getHours().toString().padStart(2, "0");
	const minutes = dateObj.getMinutes().toString().padStart(2, "0");
	const seconds = dateObj.getSeconds().toString().padStart(2, "0");

	return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};
