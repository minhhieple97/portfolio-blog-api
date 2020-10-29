exports.getUniqueList = (list, key) => {
  const memory = {};
  const result = [];
  for (let index = 0; index < list.length; index++) {
    if (memory[list[index][key]]) {
      continue;
    } else {
      memory[list[index][key]] = 1;
      result.push(list[index]);
    }
  }
  return result;
};
