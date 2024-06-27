exports.stripos = (haystack = "", needle = "", offset = 0) => {
	const lowerHaystack = haystack.toLowerCase();
	const lowerNeedle = needle.toLowerCase();

	const position = lowerHaystack.indexOf(lowerNeedle, offset);

	return position !== -1 ? true : false;
};
