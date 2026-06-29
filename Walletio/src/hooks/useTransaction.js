import { useSelector, useDispatch } from "react-redux";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
} from "../store/slices/transactionSlice";

/**
 * Custom hook for transaction state & actions
 * Usage: const { transactions, status, loadAll, add, remove } = useTransaction();
 */
export const useTransaction = () => {
  const dispatch = useDispatch();
  const { transactions, status } = useSelector((state) => state.transactions);

  const loadAll = () => dispatch(fetchTransactions());
  const add = (data) => dispatch(createTransaction(data));
  const remove = (id) => dispatch(deleteTransaction(id));

  return { transactions, status, loadAll, add, remove };
};
