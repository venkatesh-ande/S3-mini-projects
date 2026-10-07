/**
 * Runs each example once for several input sizes and prints elapsed time.
 */
public class Main {
    // Keeping results observable helps prevent the JVM from discarding work.
    private static volatile long resultSink;

    public static void main(String[] args) {
        int[] inputSizes = {10, 100, 1000,10000, 100000, 1000000};

        System.out.println("Asymptotic Growth Rate Comparison");
        System.out.println("Times are one-run measurements in nanoseconds.");
        System.out.println();
        System.out.printf("%-8s | %-12s | %-12s | %-12s | %-12s%n",
                "N", "O(1)", "O(log N)", "O(N)", "O(N^2)");
        System.out.println("---------|--------------|--------------|--------------|--------------");

        for (int n : inputSizes) {
            int[] values = createInput(n);

            long start = System.nanoTime();
            resultSink = Algorithms.constant(values);
            long constantTime = System.nanoTime() - start;

            start = System.nanoTime();
            resultSink = Algorithms.logarithmic(values);
            long logarithmicTime = System.nanoTime() - start;

            start = System.nanoTime();
            resultSink = Algorithms.linear(values);
            long linearTime = System.nanoTime() - start;

            start = System.nanoTime();
            resultSink = Algorithms.quadratic(values);
            long quadraticTime = System.nanoTime() - start;

            System.out.printf("%-8d | %-12d | %-12d | %-12d | %-12d%n",
                    n, constantTime, logarithmicTime, linearTime, quadraticTime);
        }
    }

    /** Creates a simple array containing 1, 2, ..., n. */
    private static int[] createInput(int n) {
        int[] values = new int[n];
        for (int i = 0; i < n; i++) {
            values[i] = i + 1;
        }
        return values;
    }
}
