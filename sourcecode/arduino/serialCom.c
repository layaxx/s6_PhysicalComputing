#define __AVR_ATmega328P__
#include <avr/io.h> // Contains all the I/O Register Macros
#include <stdio.h>
#include "serialCom.h"

void waitUntilReady()
{
    /* Wait for empty transmit buffer */
    while (!(UCSR0A & (1 << UDRE0)))
        ;
}

void putChar(unsigned char input)
{
    waitUntilReady();
    UDR0 = input;
}

void putString(unsigned char *input)
{
    int length = strlen(input);
    for (int i = 0; i < length; i++)
    {
        putChar(input[i]);
    }
}
void putDec(long input)
{
    int length = ceil(log10(input + 1) / log10(10));
    char *str = calloc(length, sizeof(char));
    sprintf(str, "%ld", input);
    putString(str);
    free(str);
}
void putBin(long input)
{
    int length = ceil(log10(input + 1) / log10(8));

    char *oct = calloc(length, sizeof(char));
    sprintf(oct, "%o", input);

    char *bin = calloc(length * 3, sizeof(char));
    for (int i = 0; i < length; i++)
    {
        bin[3 * i] = '0';
        bin[3 * i + 1] = '0';
        bin[3 * i + 2] = '0';
        if (oct[i] == '4' || oct[i] == '5' || oct[i] == '6' || oct[i] == '7')
        {
            bin[3 * i + 0] = '1';
        }
        if (oct[i] == '2' || oct[i] == '3' || oct[i] == '6' || oct[i] == '7')
        {
            bin[3 * i + 1] = '1';
        }
        if (oct[i] == '1' || oct[i] == '3' || oct[i] == '5' || oct[i] == '7')
        {
            bin[3 * i + 2] = '1';
        }
    }

    putString(bin);
    free(bin);
    free(oct);
}
void putHex(long input)
{
    int length = ceil(log10(input + 1) / log10(16));
    char *str = calloc(length, sizeof(char));
    sprintf(str, "%x", input);
    putString(str);
    free(str);
}

unsigned char getChar(void)
{
    /* Wait for data to be received */
    while (!(UCSR0A & (1 << RXC0)))
        ;
    /* Get and return received data from buffer */
    return UDR0;
}
