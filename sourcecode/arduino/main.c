/* cSpell:disable */
#define __AVR_ATmega328P__ // Suppress errors in VS Code

#define FOSC 16000000UL // Clock Speed
#define BAUD 250000		// Desired BAUD
#define MYUBRR FOSC / 16 / BAUD - 1

#include <stdio.h>
#include <avr/io.h> // Contains all the I/O Register Macros
#include <avr/interrupt.h>
#include <util/delay.h> // Generates a Blocking Delay
#include "serialCom.h"
#include "i2c.h"

void USART_Init(unsigned int ubrr)
{

	UBRR0H = (unsigned char)(ubrr >> 8);
	UBRR0L = (unsigned char)ubrr;
	// Enable receiver and transmitter
	UCSR0B = (1 << RXEN0) | (1 << TXEN0);
	// Set frame format: 8data, 2stop bit
	UCSR0C = (1 << USBS0) | (3 << UCSZ00);
}

static inline void I2C_init(void)
{
	TWSR = 0;  // no prescaler
	TWBR = 72; // set clock to 100kHz
}

uint8_t address = MPU_6050;

volatile short dataReadyMPU = 0;
volatile short dataReadyUS = 0;
volatile uint16_t dataMPU;
volatile uint16_t dataUS;
volatile uint16_t dataUSPre;

uint8_t data[2];

int __attribute__((OS_main)) main(void)
{
	USART_Init(MYUBRR);
	putString("\n\rDEBUG: RESET\r\n");

	I2C_init();

	// Set sleep to false, cycle to true
	I2C_poke(address, 107, 0x0); // 1 << 5);

	// set Accelerometer Range to ±2g
	I2C_poke(address,
			 28,
			 0);

	// enable Interrupts
	I2C_poke(address,
			 56,
			 1);

	// Set Sampling Rate
	I2C_poke(address,
			 25,
			 ~0);

	// set D4 as output
	DDRD |= (1 << PORTD4);
	// set D3 as input
	DDRD &= ~(1 << PORTD3);
	// set D2 as input
	DDRD &= ~(1 << PORTD2);

	// INT1 interrupt on logic level change INT0 interrupt on rising edge
	EICRA |= 0b0111;
	// ENABLE INT0 interrupt
	EIMSK |= (1 << INT0);
	// ENABLE INT0 interrupt
	EIMSK |= (1 << INT1);
	// enable global interrupts
	SREG |= (1 << SREG_I);

	TCCR1B |= 0b010; // setup clock, use 8 prescaler
	// TIMSK1 |= 1;	 // enable overflow interrupt

	trigger();

	while (1)
	{
		if (dataReadyMPU)
		{
			putString("G: ");
			I2C_read_registers(address, 67, data, 6);
			putDec((data[0] << 8) | data[1]);
			putString("\r\n");
			dataReadyMPU = 0;
		}
		if (dataReadyUS)
		{
			putString("U: ");
			putDec(dataUS - dataUSPre);
			putString("\r\n");
			dataReadyUS = 0;
			trigger();
		}
	}
	return 0;
}

ISR(INT0_vect)
{
	// Read Gyro Data
	dataReadyMPU = 1;
}
short justOverflowed = 0;
void trigger()
{
	PORTD |= (1 << PORTD4);
	_delay_us(15);
	PORTD &= ~(1 << PORTD4);
	justOverflowed = 1;
}
ISR(INT1_vect)
{
	if (justOverflowed)
	{
		dataUSPre = TCNT1;
		justOverflowed = 0;
	}
	else
	{
		dataUS = TCNT1;
		dataReadyUS = 1;
	}
}