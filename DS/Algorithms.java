/**
 * Small examples of algorithms with different growth rates.
 *
 * The methods assume that the input array is not null. An empty array is
 * allowed; each method returns zero for it.
 */
public class Algorithms {

    /** Reads one array element: O(1). */
    public static long constant(int[] values) {
        if (values.length == 0) {
            return 0;
        }
        return values[0];
    }

    /** Visits indices 1, 2, 4, 8, ...: O(log n). */
    public static long logarithmic(int[] values) {
        long sum = 0;
        int index = 1;

        while (index < values.length) {
            sum += values[index];

            // Avoid integer overflow when doubling a very large index.
            if (index > Integer.MAX_VALUE / 2) {
                break;
            }
            index *= 2;
        }

        return sum;
    }

    /** Visits every array element once: O(n). */
    public static long linear(int[] values) {
        long sum = 0;
        for (int value : values) {
            sum += value;
        }
        return sum;
    }

    /** Compares every pair of array elements: O(n^2). */
    public static long quadratic(int[] values) {
        long comparisons = 0;
        for (int i = 0; i < values.length; i++) {
            for (int j = 0; j < values.length; j++) {
                if (values[i] <= values[j]) {
                    comparisons++;
                }
            }
        }
        return comparisons;
    }
}
