const level1 = [
    {
      question: "1 + 1",
      answer: 2
    },
    {
      question: "2 + 1",
      answer: 3
    },
    {
      question: "3 - 1",
      answer: 2
    },
    {
      question: "1 + 2",
      answer: 3
    },
    {
      question: "2 - 1",
      answer: 1
    },
    {
      question: "3 - 2",
      answer: 1
    }
  ];
  
  const level2 = [
    {
      question: "1 + 1 - 1",
      answer: 1
    },
    {
      question: "1 + 2 - 1",
      answer: 2
    },
    {
      question: "3 - 2 + 1",
      answer: 2
    },
    {
      question: "3 + 1 - 2",
      answer: 2
    },
    {
      question: "2 - 1 + 2",
      answer: 3
    },
    {
      question: "3 - 1 + 1",
      answer: 3
    },
    {
      question: "3 - 2 + 2",
      answer: 3
    },
    {
      question: "2 + 1 - 2",
      answer: 1
    },
    {
      question: "3 + 1 - 3",
      answer: 1
    },
    {
      question: "1 - 1 + 3",
      answer: 3
    },
    {
      question: "1 + 3 - 2",
      answer: 2
    },
    {
      question: "2 + 3 - 3",
      answer: 2
    }
  ];
  
  const level3 = [
    {
      question: "(3 - 2) + 1",
      answer: 2
    },
    {
      question: "2 + (1 - 2)",
      answer: 1
    },
    {
      question: "(3 + 1) - 3",
      answer: 1
    },
    {
      question: "(1 + 2) - 1",
      answer: 2
    },
    {
      question: "1 + (3 - 2)",
      answer: 2
    },
    {
      question: "(2 + 3) - 3",
      answer: 2
    },
    {
      question: "3 - (1 + 1)",
      answer: 1
    },
    {
      question: "2 - (3 - 2)",
      answer: 1
    },
    {
      question: "2 + (3 - 2)",
      answer: 3
    },
    {
      question: "1 + (3 - 1)",
      answer: 3
    },
    {
      question: "3 - (1 + 1)",
      answer: 1
    }
  ];
  
  const level4 = [
    {
      question: "(1 + 1) * 1",
      answer: 2
    },
    {
      question: "(1 + 2) * 1",
      answer: 3
    },
    {
      question: "2 * (3 - 2)",
      answer: 2
    },
    {
      question: "(3 * 1) - 2",
      answer: 1
    },
    {
      question: "(1 * 2) - 1",
      answer: 1
    },
    {
      question: "1 * (3 - 2)",
      answer: 1
    },
    {
      question: "(3 - 2) * 3",
      answer: 3
    },
    {
      question: "(2 - 1) * 3",
      answer: 3
    },
    {
      question: "2 * 2 - 1",
      answer: 3
    },
    {
      question: "2 * 1 + 1",
      answer: 3
    }
  ];
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  const shuffleAllLevels = () => {
    shuffleArray(level1);
    shuffleArray(level2);
    shuffleArray(level3);
    shuffleArray(level4);
  };
  
  export const getRandomList = () => {
    const result = [];
  
    shuffleAllLevels();
    result.push(...level1.slice(0, 5));
    result.push(...level2.slice(0, 5));
    result.push(...level3.slice(0, 5));
    result.push(...level4.slice(0, 5));
  
    return result;
  };