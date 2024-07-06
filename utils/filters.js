const filterByLang = (items = [], lang, ...fields) => {
	try {
		const langSuffix = "_" + lang;
		const result = [];

		for (let item of items) {
			let newItem = {...(item._doc || item)};

			for (let field of fields) {
				let fieldPath = field.split(".");
				let currentValue = newItem;

				for (let i = 0; i < fieldPath.length - 1; i++) {
					if (currentValue[fieldPath[i]] === undefined) {
						currentValue = undefined;
						break;
					}
					currentValue = currentValue[fieldPath[i]];
				}

				if (currentValue !== undefined) {
					const lastKey = fieldPath[fieldPath.length - 1];
					if (currentValue[`${lastKey}${langSuffix}`] !== undefined) {
						if (currentValue._doc) {
							currentValue = currentValue._doc;
						}
						currentValue[lastKey] = currentValue[`${lastKey}${langSuffix}`];
						if (field.includes(".")) {
							item[field.split(".")[0]] = currentValue;
						}
					}
				}
			}

			result.push(newItem);
		}

		return result;
	} catch (err) {
		console.log(err);
		return {
			message: err.message,
			error: "Error in filtering by language.",
		};
	}
};

module.exports = filterByLang;
