const prisma = require('../config/prismaClient');

// Add an expense
exports.addExpense = async (req, res) => {
  const { amount, description, paidBy, groupID, type, categoryID, splits } = req.body;

  try {
    const expense = await prisma.expenses.create({
      data: {
        amount,
        description,
        paidBy,
        date: new Date(),
        type,
        groupID,
        categoryID,
        splits: {
          create: splits.map(split => ({
            userID: split.userID,
            amount: split.amount,
          })),
        },
      },
    });

    // Update balances
    for (const split of splits) {
      const existingBalance = await prisma.balances.findFirst({
        where: {
          userID: split.userID,
          friendID: paidBy,
        },
      });

      if (existingBalance) {
        await prisma.balances.update({
          where: { id: existingBalance.id },
          data: { amountOwed: existingBalance.amountOwed + split.amount },
        });
      } else {
        await prisma.balances.create({
          data: {
            userID: split.userID,
            friendID: paidBy,
            amountOwed: split.amount,
          },
        });
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

// Get expenses by group
exports.getExpensesByGroup = async (req, res) => {
  const { groupID } = req.params;

  try {
    const expenses = await prisma.expenses.findMany({
      where: { groupID: Number(groupID) },
      include: { category: true, splits: true, user: true },
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch group expenses' });
  }
};

// Get expenses by user
exports.getUserExpenses = async (req, res) => {
  const { userID } = req.params;

  try {
    const expenses = await prisma.expenses.findMany({
      where: { paidBy: Number(userID) },
      include: { category: true, splits: true, user: true },
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user expenses' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  const { expenseID } = req.params;

  try {
    await prisma.expenses.delete({
      where: { expenseID: Number(expenseID) },
    });

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  const { expenseID } = req.params;
  const { amount, description, categoryID } = req.body;

  try {
    const updatedExpense = await prisma.expenses.update({
      where: { expenseID: Number(expenseID) },
      data: { amount, description, categoryID },
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

// Get balances for a user
exports.getBalances = async (req, res) => {
  const { userID } = req;

  try {
    const balances = await prisma.balances.findMany({
      where: { userID: Number(userID) },
      include: { user: true, friend: true },
    });

    res.status(200).json(balances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch balances' });
  }
};
